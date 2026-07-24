"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importAndScoreJob, scoreExistingJob } from "@/lib/jobs/service";
import { JobFetchError } from "@/lib/jobs/fetch-url";
import { generateResumeForJob } from "@/lib/resume/service";
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
}

export async function generateResumeAction(formData: FormData) {
  const jobId = String(formData.get("jobId"));
  const pageLength = Number(formData.get("pageLength") ?? 1) === 2 ? 2 : 1;
  await generateResumeForJob(jobId, pageLength);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/resume-studio");
  redirect("/resume-studio");
}

export async function recordApplicationAction(formData: FormData) {
  const jobId = String(formData.get("jobId"));
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const latestResume = await prisma.resumeVersion.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });

  await prisma.application.create({
    data: {
      userId: job.userId,
      jobId,
      resumeVersionId: latestResume?.id,
      status: "applied",
      submittedAt: new Date(),
      submissionChannel: String(formData.get("submissionChannel") || "manual"),
      salaryAsked: String(formData.get("salaryAsked") || "") || null,
      referral: String(formData.get("referral") || "") || null,
      interviewStage: String(formData.get("interviewStage") || "none"),
      locationApplied: String(formData.get("locationApplied") || job.location || "") || null,
      followUpAt: formData.get("followUpAt")
        ? new Date(String(formData.get("followUpAt")))
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: String(formData.get("notes") || "") || null,
    },
  });
  await prisma.job.update({ where: { id: jobId }, data: { status: "applied" } });
  revalidatePath("/applications");
  revalidatePath(`/jobs/${jobId}`);
  redirect("/applications");
}

export async function updateApplicationAction(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.application.update({
    where: { id },
    data: {
      status: String(formData.get("status") || "applied"),
      interviewStage: String(formData.get("interviewStage") || "none"),
      salaryAsked: String(formData.get("salaryAsked") || "") || null,
      referral: String(formData.get("referral") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      followUpAt: formData.get("followUpAt")
        ? new Date(String(formData.get("followUpAt")))
        : undefined,
      recruiterName: String(formData.get("recruiterName") || "") || null,
      recruiterEmail: String(formData.get("recruiterEmail") || "") || null,
    },
  });
  revalidatePath("/applications");
}

export async function updateSettingsAction(formData: FormData) {
  const user = await getPrimaryUser();
  await prisma.settings.update({
    where: { userId: user.id },
    data: {
      salaryFloorEur: Number(formData.get("salaryFloorEur") ?? 40000),
      includeFallbackVideoRoles: formData.get("includeFallbackVideoRoles") === "on",
      salaryFloorSoft: formData.get("salaryFloorSoft") === "on",
      dailyBatchTarget: Number(formData.get("dailyBatchTarget") ?? 25),
    },
  });
  revalidatePath("/settings");
}
