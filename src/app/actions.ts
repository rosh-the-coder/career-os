"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importAndScoreJob, scoreExistingJob } from "@/lib/jobs/service";
import { JobFetchError } from "@/lib/jobs/fetch-url";
import { generateResumeForJob, analyzeResumeKeywordsForJob, suggestResumeAtsEditsForJob, applyResumeAtsEditsForJob } from "@/lib/resume/service";
import { prisma } from "@/lib/db/prisma";
import { getPrimaryUser } from "@/lib/auth/user";

export type ActionState = { error?: string; ok?: boolean };

export async function importJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const description = String(formData.get("description") ?? "");
  const url = String(formData.get("url") ?? "") || undefined;
  const title = String(formData.get("title") ?? "") || undefined;
  const company = String(formData.get("company") ?? "") || undefined;
  const listingCategory = String(formData.get("listingCategory") ?? "auto");

  try {
    const job = await importAndScoreJob({
      description,
      url,
      title,
      company,
      listingCategory:
        listingCategory === "ireland_core" || listingCategory === "eu_sponsorship"
          ? listingCategory
          : undefined,
    });
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    redirect(`/jobs/${job.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err; // Next redirect
    const message =
      err instanceof JobFetchError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Import failed";
    return { error: message };
  }
}

export async function rescoreJobAction(formData: FormData) {
  const jobId = String(formData.get("jobId"));
  await scoreExistingJob(jobId);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/approve");
  revalidatePath("/dashboard");
}

/** Edit JD text; marks prior LLM score as stale so Approve shows Click again. */
export async function updateJobDescriptionAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const jobId = String(formData.get("jobId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  if (!jobId) return { ok: false, error: "Missing job id" };
  if (!description) return { ok: false, error: "Description required" };

  try {
    const { assertOwnedJobId } = await import("@/lib/auth/ownership");
    await assertOwnedJobId(jobId);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        descriptionRaw: description,
        descriptionClean: description,
      },
    });
    await prisma.jobScore.updateMany({
      where: { jobId },
      data: { modelVersion: "pending-llm" },
    });
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/approve");
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}

export async function generateResumeAction(formData: FormData) {
  const jobId = String(formData.get("jobId"));
  const pageLength = Number(formData.get("pageLength") ?? 1) === 2 ? 2 : 1;
  try {
    await generateResumeForJob(jobId, pageLength);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Resume generation failed";
    console.error("[generateResumeAction]", msg);
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(msg.slice(0, 240))}`);
  }
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/resume-studio");
  redirect(`/jobs/${jobId}?resume=1`);
}

export async function analyzeResumeKeywordsAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const jobId = String(formData.get("jobId"));
  const resumeVersionId = String(formData.get("resumeVersionId") ?? "") || undefined;
  try {
    await analyzeResumeKeywordsForJob(jobId, resumeVersionId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/resume-studio");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Analyze failed" };
  }
}

export async function suggestResumeAtsEditsAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const jobId = String(formData.get("jobId"));
  const resumeVersionId = String(formData.get("resumeVersionId") ?? "") || undefined;
  try {
    await suggestResumeAtsEditsForJob(jobId, resumeVersionId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/resume-studio");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Suggest failed" };
  }
}

export async function applyResumeAtsEditsAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const jobId = String(formData.get("jobId"));
  const resumeVersionId = String(formData.get("resumeVersionId"));
  const indexes = formData
    .getAll("editIndex")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0);
  try {
    await applyResumeAtsEditsForJob(jobId, resumeVersionId, indexes);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/resume-studio");
    revalidatePath("/approve");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Apply failed" };
  }
}

export async function recordApplicationAction(formData: FormData) {
  const jobId = String(formData.get("jobId"));
  const { createApplicationFromJob } = await import("@/lib/applications/service");
  await createApplicationFromJob(jobId);
  revalidatePath("/applications");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  redirect("/applications");
}

export async function patchApplicationAction(
  id: string,
  patch: import("@/lib/applications/service").ApplicationPatch,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { patchApplication } = await import("@/lib/applications/service");
    await patchApplication(id, patch);
    revalidatePath("/applications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function createBlankApplicationAction(): Promise<{
  ok: boolean;
  error?: string;
  row?: import("@/lib/applications/constants").TrackerRow;
}> {
  try {
    const { createBlankApplication, toTrackerRow } = await import("@/lib/applications/service");
    const app = await createBlankApplication();
    const full = await prisma.application.findUniqueOrThrow({
      where: { id: app.id },
      include: { job: true, resumeVersion: true },
    });
    revalidatePath("/applications");
    return { ok: true, row: toTrackerRow(full) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Create failed" };
  }
}

export async function reorderApplicationsAction(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { reorderApplications } = await import("@/lib/applications/service");
    await reorderApplications(orderedIds);
    revalidatePath("/applications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Reorder failed" };
  }
}

export async function deleteApplicationAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { deleteApplication } = await import("@/lib/applications/service");
    await deleteApplication(id);
    revalidatePath("/applications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

/** @deprecated Prefer patchApplicationAction — kept for any leftover forms */
export async function updateApplicationAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { patchApplication } = await import("@/lib/applications/service");
  await patchApplication(id, {
    salaryAsked: String(formData.get("salaryAsked") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    recruiterName: String(formData.get("recruiterName") || "") || null,
    statusTags: [String(formData.get("status") || "Applied")],
  });
  revalidatePath("/applications");
}

export async function updateSettingsAction(formData: FormData) {
  const user = await getPrimaryUser();
  const marketsRaw = String(formData.get("markets") ?? "").trim();
  const markets = marketsRaw
    ? marketsRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  await prisma.settings.update({
    where: { userId: user.id },
    data: {
      salaryFloorEur: Number(formData.get("salaryFloorEur") ?? 40000),
      includeFallbackVideoRoles: formData.get("includeFallbackVideoRoles") === "on",
      salaryFloorSoft: formData.get("salaryFloorSoft") === "on",
      dailyBatchTarget: Number(formData.get("dailyBatchTarget") ?? 25),
      ...(formData.has("location")
        ? { location: String(formData.get("location") ?? "") }
        : {}),
      ...(formData.has("currentPermission")
        ? { currentPermission: String(formData.get("currentPermission") ?? "") }
        : {}),
      ...(formData.has("permissionValidUntil")
        ? { permissionValidUntil: String(formData.get("permissionValidUntil") ?? "") }
        : {}),
      ...(formData.has("permissionRenewableUntil")
        ? { permissionRenewableUntil: String(formData.get("permissionRenewableUntil") ?? "") }
        : {}),
      ...(formData.has("contactEmail")
        ? { contactEmail: String(formData.get("contactEmail") ?? "") }
        : {}),
      ...(formData.has("phone") ? { phone: String(formData.get("phone") ?? "") } : {}),
      ...(formData.has("portfolioUrl")
        ? { portfolioUrl: String(formData.get("portfolioUrl") ?? "") }
        : {}),
      ...(formData.has("githubUrl") ? { githubUrl: String(formData.get("githubUrl") ?? "") } : {}),
      ...(formData.has("linkedinUrl")
        ? { linkedinUrl: String(formData.get("linkedinUrl") ?? "") }
        : {}),
      ...(formData.has("targetRolesText")
        ? { targetRolesText: String(formData.get("targetRolesText") ?? "") }
        : {}),
      ...(formData.has("excludedRolesText")
        ? { excludedRolesText: String(formData.get("excludedRolesText") ?? "") }
        : {}),
      ...(formData.has("primaryMarketLabel")
        ? { primaryMarketLabel: String(formData.get("primaryMarketLabel") ?? "") }
        : {}),
      ...(formData.has("candidatePositioning")
        ? { candidatePositioning: String(formData.get("candidatePositioning") ?? "") }
        : {}),
      ...(markets ? { marketsJson: JSON.stringify(markets) } : {}),
      ...(formData.has("maxDiscoversPerDay")
        ? { maxDiscoversPerDay: Number(formData.get("maxDiscoversPerDay") ?? 3) }
        : {}),
    },
  });
  if (formData.has("name")) {
    const name = String(formData.get("name") ?? "").trim();
    if (name) await prisma.user.update({ where: { id: user.id }, data: { name } });
  }
  revalidatePath("/settings");
  revalidatePath("/onboarding");
}

export async function runDiscoveryAction(): Promise<{
  ok: boolean;
  error?: string;
  irelandCoreAdded?: number;
  euSponsorshipAdded?: number;
  skippedDuplicates?: number;
  skippedFilters?: number;
  samples?: { title: string; company: string; score: number; category: string }[];
}> {
  try {
    const { assertDiscoverAllowed } = await import("@/lib/auth/quotas");
    await assertDiscoverAllowed();
    const { runJobDiscovery } = await import("@/lib/jobs/discover");
    const result = await runJobDiscovery();
    revalidatePath("/dashboard");
    revalidatePath("/jobs");
    revalidatePath("/approve");
    return {
      ok: true,
      irelandCoreAdded: result.irelandCoreAdded,
      euSponsorshipAdded: result.euSponsorshipAdded,
      skippedDuplicates: result.skippedDuplicates,
      skippedFilters: result.skippedFilters,
      samples: result.samples,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Discovery failed",
    };
  }
}

export async function prepareResumePacksAction(formData: FormData) {
  const user = await getPrimaryUser();
  const ids = formData.getAll("jobIds").map(String).filter(Boolean);
  if (!ids.length) {
    return {
      ok: false as const,
      error: "Select at least one job",
      prepared: 0,
      failed: [] as { id: string; error: string }[],
    };
  }

  const prepared: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const jobId of ids) {
    try {
      const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
      if (!job || job.status === "rejected") {
        failed.push({ id: jobId, error: "Rejected or missing" });
        continue;
      }
      await generateResumeForJob(jobId, 1);
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "materials_ready" },
      });
      prepared.push(jobId);
    } catch (err) {
      failed.push({ id: jobId, error: err instanceof Error ? err.message : "Failed" });
    }
  }

  revalidatePath("/jobs");
  revalidatePath("/approve");
  revalidatePath("/resume-studio");
  revalidatePath("/dashboard");

  return {
    ok: true as const,
    prepared: prepared.length,
    failed,
  };
}

export async function saveJobsAction(formData: FormData) {
  const user = await getPrimaryUser();
  const ids = formData.getAll("jobIds").map(String).filter(Boolean);
  if (ids.length) {
    await prisma.job.updateMany({
      where: { id: { in: ids }, userId: user.id, NOT: { status: "rejected" } },
      data: { status: "saved" },
    });
  }
  revalidatePath("/jobs");
  revalidatePath("/approve");
  revalidatePath("/dashboard");
}
