"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getPrimaryUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { refreshCompleteness } from "@/lib/onboarding/completeness";
import { parseCareerHistoryMarkdown } from "@/lib/onboarding/parse-history-md";
import { parseResumeText } from "@/lib/onboarding/parse-resume-text";
import { extractTextFromUpload } from "@/lib/onboarding/extract-file-text";
import { seedFromParsedResume, seedInventoryFromParsed } from "@/lib/onboarding/seed-inventory";
import { deleteUserApiKey, upsertUserApiKey } from "@/lib/byok/keys";
import { createInvite } from "@/lib/auth/invites";
import { sendInviteAcceptedEmail } from "@/lib/auth/access-requests";
import { appBaseUrl } from "@/lib/notifications/email";

export async function saveOnboardingBasicsAction(formData: FormData) {
  const user = await getPrimaryUser();
  const name = String(formData.get("name") ?? "").trim();
  const age = Number(formData.get("age") ?? 0);
  const contactEmail = String(formData.get("contactEmail") ?? user.email).trim();

  if (!name) {
    redirect("/onboarding?stage=basics&error=name");
  }
  if (!Number.isFinite(age) || age < 18) {
    redirect("/onboarding?stage=basics&error=age");
  }

  // Name+age+contact ≈ 20% of weighted slots — skip full completeness recompute (was multi-second).
  const approxScore = Math.max(user.completenessScore, 20);

  await Promise.all([
    prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        age,
        onboardingStatus: "in_progress",
        onboardingStep: "evidence",
        completenessScore: approxScore,
      },
    }),
    prisma.settings.update({
      where: { userId: user.id },
      data: {
        contactEmail: contactEmail || user.email,
      },
    }),
  ]);

  redirect("/onboarding?stage=evidence");
}

export async function uploadResumeAction(formData: FormData) {
  const user = await getPrimaryUser();
  let count = await prisma.uploadedResume.count({ where: { userId: user.id } });
  if (count >= 5) {
    redirect("/onboarding?stage=evidence&error=resume_limit");
  }

  const pasted = String(formData.get("pastedText") ?? "").trim();
  const fileList = formData.getAll("files").filter(
    (f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0,
  );
  // Back-compat single `file` field
  const single = formData.get("file");
  if (single && typeof single === "object" && "arrayBuffer" in single && (single as File).size > 0) {
    fileList.unshift(single as File);
  }

  type Incoming = { fileName: string; mimeType: string; textContent: string; byteSize: number };
  const incoming: Incoming[] = [];

  for (const f of fileList) {
    const buf = Buffer.from(await f.arrayBuffer());
    const extracted = await extractTextFromUpload(buf, f.name || "resume", f.type);
    if ("error" in extracted) {
      if (extracted.error === "pdf_empty") {
        redirect("/onboarding?stage=evidence&error=pdf_empty");
      }
      continue;
    }
    if (!extracted.text) continue;
    incoming.push({
      fileName: f.name || "resume.txt",
      mimeType: extracted.mimeType,
      textContent: extracted.text,
      byteSize: buf.length,
    });
  }

  if (pasted) {
    incoming.push({
      fileName: "pasted-resume.txt",
      mimeType: "text/plain",
      textContent: pasted.slice(0, 200_000),
      byteSize: pasted.length,
    });
  }

  if (!incoming.length) {
    redirect("/onboarding?stage=evidence&error=resume_empty");
  }

  const room = Math.max(0, 5 - count);
  const toStore = incoming.slice(0, room);
  if (!toStore.length) {
    redirect("/onboarding?stage=evidence&error=resume_limit");
  }

  let settingsSnap = user.settings;
  let parsedExp = 0;
  let parsedSkills = 0;
  let parsedProjects = 0;

  for (const item of toStore) {
    await prisma.uploadedResume.create({
      data: {
        userId: user.id,
        fileName: item.fileName,
        mimeType: item.mimeType,
        textContent: item.textContent,
        byteSize: item.byteSize,
      },
    });
    count += 1;

    const parsed = parseResumeText(item.textContent);
    await seedFromParsedResume(user.id, parsed, {
      candidatePositioning: settingsSnap?.candidatePositioning,
      targetRolesText: settingsSnap?.targetRolesText,
      contactEmail: settingsSnap?.contactEmail,
      location: settingsSnap?.location,
    });
    parsedExp += parsed.experiences.length;
    parsedSkills += parsed.skills.length;
    parsedProjects += parsed.projects.length;

    settingsSnap = await prisma.settings.findUnique({ where: { userId: user.id } });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      onboardingStep: "evidence",
      completenessScore: Math.max(user.completenessScore, 45),
    },
  });

  const q = new URLSearchParams({
    stage: "evidence",
    resume: "1",
    parsed: "1",
    e: String(parsedExp),
    s: String(parsedSkills),
    p: String(parsedProjects),
  });
  redirect(`/onboarding?${q.toString()}`);
}

export async function saveCareerHistoryMdAction(formData: FormData) {
  const user = await getPrimaryUser();
  let markdown = String(formData.get("markdown") ?? "").trim();

  const file = formData.get("file");
  if ((!markdown || markdown.length < 20) && file && typeof file === "object" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0) {
      const lower = (f.name || "").toLowerCase();
      if (lower.endsWith(".pdf")) {
        redirect("/onboarding?stage=evidence&error=pdf");
      }
      markdown = Buffer.from(await f.arrayBuffer()).toString("utf8").trim();
    }
  }

  if (!markdown) {
    redirect("/onboarding?stage=evidence&error=md_empty");
  }

  try {
    const parsed = parseCareerHistoryMarkdown(markdown);
    await prisma.careerHistoryDraft.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        markdown: markdown.slice(0, 400_000),
        parsedJson: JSON.stringify(parsed),
        reviewed: false,
      },
      update: {
        markdown: markdown.slice(0, 400_000),
        parsedJson: JSON.stringify(parsed),
        reviewed: false,
      },
    });

    // Also store as an uploaded resume so completeness counts it
    const resumeCount = await prisma.uploadedResume.count({ where: { userId: user.id } });
    if (resumeCount < 5) {
      await prisma.uploadedResume.create({
        data: {
          userId: user.id,
          fileName: "career-history.md",
          mimeType: "text/markdown",
          textContent: markdown.slice(0, 200_000),
          byteSize: Math.min(markdown.length, 200_000),
        },
      });
    }

    await seedInventoryFromParsed(user.id, parsed, {
      softSettings: true,
      existing: {
        candidatePositioning: user.settings?.candidatePositioning,
        targetRolesText: user.settings?.targetRolesText,
        contactEmail: user.settings?.contactEmail,
        location: user.settings?.location,
      },
    });

    // Structured .md sections → settings (beyond generic inventory seed)
    const seed: Record<string, string> = {};
    const summaryNote = parsed.notes.find((n) => /career summary|summary/i.test(n));
    if (summaryNote && !user.settings?.candidatePositioning?.trim()) {
      seed.candidatePositioning = summaryNote.replace(/^[^:]+:\s*/, "").slice(0, 500);
    }
    const marketsLine = markdown.match(/#\s*Target markets[\s\S]*?(?=\n#|$)/i)?.[0] ?? "";
    const marketItems = marketsLine
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l && !l.startsWith("#"));
    const rolesLine = markdown.match(/#\s*Target roles[\s\S]*?(?=\n#|$)/i)?.[0] ?? "";
    const roleItems = rolesLine
      .split(/[,\n]/)
      .map((l) => l.replace(/^[-*•#].*?\s*/, "").replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l.length > 2 && l.length < 80 && !/^target roles$/i.test(l));
    if (roleItems.length && !user.settings?.targetRolesText?.trim()) {
      seed.targetRolesText = roleItems.slice(0, 12).join(", ");
    }
    const avoidLine = markdown.match(/#\s*Roles to avoid[\s\S]*?(?=\n#|$)/i)?.[0] ?? "";
    const avoidItems = avoidLine
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l && !l.startsWith("#"));
    if (avoidItems.length && !user.settings?.excludedRolesText?.trim()) {
      seed.excludedRolesText = avoidItems.slice(0, 12).join(", ");
    }
    const homeLine = markdown.match(/#\s*Home location\s*\n+([^\n#]+)/i)?.[1]?.trim();
    if (homeLine && (!user.settings?.location || user.settings.location === "Not set")) {
      seed.location = homeLine.slice(0, 120);
    }
    const eligibilityLine = markdown.match(/#\s*Work eligibility\s*\n+([\s\S]*?)(?=\n#|$)/i)?.[1]?.trim();
    if (
      eligibilityLine &&
      (!user.settings?.currentPermission || user.settings.currentPermission === "Unknown")
    ) {
      seed.currentPermission = eligibilityLine.split("\n")[0]!.replace(/^[-*•]\s*/, "").slice(0, 200);
    }
    if (marketItems.length) {
      const cleanMarkets = marketItems
        .map((m) => m.replace(/^[-*•]\s*/, "").trim())
        .filter((m) => m.length > 1 && m.length < 80);
      const existingMarkets = (() => {
        try {
          return JSON.parse(user.settings?.marketsJson || "[]") as string[];
        } catch {
          return [];
        }
      })();
      if (!existingMarkets.length && cleanMarkets.length) {
        seed.marketsJson = JSON.stringify(cleanMarkets.slice(0, 12));
        seed.primaryMarketLabel = cleanMarkets[0]!;
        seed.allowedLocationsJson = JSON.stringify(cleanMarkets.slice(0, 12));
      }
    }

    if (Object.keys(seed).length) {
      await prisma.settings.update({ where: { userId: user.id }, data: seed });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStep: "direction", completenessScore: Math.max(user.completenessScore, 55) },
    });
    redirect("/onboarding?stage=direction&imported=1");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[saveCareerHistoryMdAction]", err);
    redirect("/onboarding?stage=evidence&error=md_parse");
  }
}

export async function saveApiKeyAction(formData: FormData) {
  const user = await getPrimaryUser();
  const provider = String(formData.get("provider") ?? "");
  const value = String(formData.get("value") ?? "");
  await upsertUserApiKey(user.id, provider, value);
  await refreshCompleteness(user.id);
  revalidatePath("/settings");
  revalidatePath("/onboarding");
}

export async function deleteApiKeyAction(formData: FormData) {
  const user = await getPrimaryUser();
  const provider = String(formData.get("provider") ?? "");
  await deleteUserApiKey(user.id, provider);
  await refreshCompleteness(user.id);
  revalidatePath("/settings");
  revalidatePath("/onboarding");
}

export async function saveOnboardingAnswerAction(formData: FormData) {
  const user = await getPrimaryUser();
  const slotKey = String(formData.get("slotKey") ?? "");
  const question = String(formData.get("question") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  if (!slotKey || !answer) throw new Error("Answer required");

  await prisma.onboardingAnswer.upsert({
    where: { userId_slotKey: { userId: user.id, slotKey } },
    create: { userId: user.id, slotKey, question, answer },
    update: { question, answer },
  });

  // Map common slots into settings
  if (slotKey === "permission") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { currentPermission: answer },
    });
  }
  if (slotKey === "location") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { location: answer },
    });
  }
  if (slotKey === "roles") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { targetRolesText: answer },
    });
  }
  if (slotKey === "positioning") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { candidatePositioning: answer },
    });
  }
  if (slotKey === "contact") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { contactEmail: answer },
    });
  }
  if (slotKey === "markets") {
    const markets = answer.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    await prisma.settings.update({
      where: { userId: user.id },
      data: {
        marketsJson: JSON.stringify(markets),
        primaryMarketLabel: markets[0] ?? "",
      },
    });
  }

  redirect("/onboarding?stage=evidence");
}

export async function finishOnboardingAction() {
  const user = await getPrimaryUser();
  const report = await refreshCompleteness(user.id);
  if (!report.ready && !user.isOperator) {
    redirect("/onboarding?stage=review");
  }
  const hasPermission =
    Boolean(user.settings?.currentPermission?.trim()) &&
    user.settings!.currentPermission !== "Unknown";
  const markets = (() => {
    try {
      return JSON.parse(user.settings?.marketsJson || "[]") as string[];
    } catch {
      return [];
    }
  })();
  const checklist = {
    profile: report.score >= 50,
    markets: markets.length > 0,
    eligibility: hasPermission,
    ai: report.slots.find((s) => s.key === "llm_key")?.filled ?? false,
    firstJob: false,
    firstResume: false,
    firstApp: false,
    dismissed: false,
  };
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingStatus: "complete", onboardingStep: "done", completenessScore: report.score },
  });
  await prisma.settings.update({
    where: { userId: user.id },
    data: { setupChecklistJson: JSON.stringify(checklist) },
  });
  const { track } = await import("@/lib/analytics/events");
  track("onboarding_completed", { score: report.score });
  redirect("/onboarding/first-run");
}

export async function setOnboardingStageAction(formData: FormData) {
  const user = await getPrimaryUser();
  const stage = String(formData.get("stage") ?? "basics");
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingStatus: "in_progress", onboardingStep: stage },
  });
  redirect(`/onboarding?stage=${stage}`);
}

export async function saveDirectionAction(formData: FormData) {
  const user = await getPrimaryUser();
  const targetRolesText = String(formData.get("targetRolesText") ?? "").trim();
  const excludedRolesText = String(formData.get("excludedRolesText") ?? "").trim();
  const candidatePositioning = String(formData.get("candidatePositioning") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const currentPermission = String(formData.get("currentPermission") ?? "").trim();

  let markets: string[] = [];
  const marketsJsonRaw = String(formData.get("marketsJson") ?? "").trim();
  if (marketsJsonRaw) {
    try {
      const parsed = JSON.parse(marketsJsonRaw) as unknown;
      if (Array.isArray(parsed)) {
        markets = parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      /* fall through */
    }
  }
  if (!markets.length) {
    markets = String(formData.get("markets") ?? "")
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!markets.length) {
    redirect("/onboarding?stage=direction&error=markets");
  }
  if (!targetRolesText) {
    redirect("/onboarding?stage=direction&error=roles");
  }

  const primaryMarketLabel = markets[0] ?? "";

  await prisma.settings.update({
    where: { userId: user.id },
    data: {
      targetRolesText,
      excludedRolesText,
      candidatePositioning,
      marketsJson: JSON.stringify(markets),
      primaryMarketLabel,
      allowedLocationsJson: JSON.stringify(markets),
      location: location || primaryMarketLabel || "Not set",
      currentPermission: currentPermission || "Unknown",
    },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingStep: "tools" },
  });
  redirect("/onboarding?stage=tools");
}

export async function createInviteAction(formData: FormData) {
  const user = await getPrimaryUser();
  if (!user.isOperator) throw new Error("Only the operator can invite");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  await createInvite({ email, createdById: user.id });

  await prisma.accessRequest.updateMany({
    where: { email, status: "pending" },
    data: { status: "invited" },
  });

  const loginUrl = `${appBaseUrl()}/login`;
  void sendInviteAcceptedEmail({
    email,
    firstName: email.split("@")[0] ?? "there",
    loginUrl,
  });

  revalidatePath("/settings");
  revalidatePath("/admin/invites");
}

export async function inviteAccessRequestAction(formData: FormData) {
  const user = await getPrimaryUser();
  if (!user.isOperator) throw new Error("Only the operator can invite");
  const id = String(formData.get("accessRequestId") ?? "");
  const { inviteFromAccessRequest } = await import("@/lib/auth/access-requests");
  await inviteFromAccessRequest(id, user.id);
  revalidatePath("/settings");
}

export async function dismissAccessRequestAction(formData: FormData) {
  const user = await getPrimaryUser();
  if (!user.isOperator) throw new Error("Only the operator can dismiss requests");
  const id = String(formData.get("accessRequestId") ?? "");
  const { dismissAccessRequest } = await import("@/lib/auth/access-requests");
  await dismissAccessRequest(id);
  revalidatePath("/settings");
}

export async function dismissFirstRunChecklistAction() {
  const user = await getPrimaryUser();
  let checklist: Record<string, unknown> = {};
  try {
    checklist = JSON.parse(user.settings?.setupChecklistJson || "{}") as Record<string, unknown>;
  } catch {
    checklist = {};
  }
  checklist.dismissed = true;
  await prisma.settings.update({
    where: { userId: user.id },
    data: { setupChecklistJson: JSON.stringify(checklist) },
  });
  revalidatePath("/dashboard");
}

export async function markChecklistItemAction(item: keyof import("@/components/onboarding/first-run-checklist").ChecklistState) {
  const user = await getPrimaryUser();
  let checklist: Record<string, unknown> = {};
  try {
    checklist = JSON.parse(user.settings?.setupChecklistJson || "{}") as Record<string, unknown>;
  } catch {
    checklist = {};
  }
  if (item === "dismissed") return;
  checklist[item] = true;
  await prisma.settings.update({
    where: { userId: user.id },
    data: { setupChecklistJson: JSON.stringify(checklist) },
  });
  revalidatePath("/dashboard");
}
