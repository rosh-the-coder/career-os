import { prisma } from "@/lib/db/prisma";
import { getPrimaryUser } from "@/lib/auth/user";
import { parseJsonArray } from "@/lib/utils";
import {
  legacyStatusToTags,
  primaryTagToStatus,
  type TrackerRow,
} from "@/lib/applications/constants";

function remoteLabel(remoteType: string | null | undefined): string | null {
  if (!remoteType || remoteType === "unknown") return null;
  if (remoteType === "onsite") return "In Person";
  if (remoteType === "hybrid") return "Hybrid";
  if (remoteType === "remote") return "Remote";
  return remoteType;
}

function salaryFromJob(job: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
}): string | null {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  const cur = job.salaryCurrency === "EUR" || !job.salaryCurrency ? "€" : `${job.salaryCurrency} `;
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${cur}${job.salaryMin.toLocaleString("en-IE")}–${job.salaryMax.toLocaleString("en-IE")}`;
  }
  const n = job.salaryMax ?? job.salaryMin!;
  return `${cur}${n.toLocaleString("en-IE")}`;
}

export function toTrackerRow(a: {
  id: string;
  jobId: string | null;
  companyName: string | null;
  positionTitle: string | null;
  status: string;
  statusTagsJson: string;
  nextActionsJson: string;
  submittedAt: Date | null;
  salaryAsked: string | null;
  website: string | null;
  referenceLink: string | null;
  recruiterName: string | null;
  locationApplied: string | null;
  workSetting: string | null;
  notes: string | null;
  sortOrder: number;
  job: {
    title: string;
    company: string;
    url: string | null;
    location: string | null;
    remoteType: string | null;
  } | null;
  resumeVersion: { id: string; fileName: string | null } | null;
}): TrackerRow {
  let statusTags = parseJsonArray<string>(a.statusTagsJson);
  if (!statusTags.length) statusTags = legacyStatusToTags(a.status);
  const nextActions = parseJsonArray<string>(a.nextActionsJson);

  return {
    id: a.id,
    jobId: a.jobId,
    company: a.companyName || a.job?.company || "Untitled",
    position: a.positionTitle || a.job?.title || "",
    statusTags,
    applicationDate: a.submittedAt ? a.submittedAt.toISOString().slice(0, 10) : null,
    salaryAsked: a.salaryAsked,
    nextActions,
    website: a.website || a.job?.url || null,
    contact: a.recruiterName,
    referenceLink: a.referenceLink,
    location: a.locationApplied || a.job?.location || null,
    workSetting: a.workSetting || remoteLabel(a.job?.remoteType) || null,
    notes: a.notes,
    resumeFileName: a.resumeVersion?.fileName ?? null,
    resumeVersionId: a.resumeVersion?.id ?? null,
    sortOrder: a.sortOrder,
    jobUrl: a.job?.url ?? null,
  };
}

export async function listTrackerRows(): Promise<TrackerRow[]> {
  const user = await getPrimaryUser();
  const rows = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true, resumeVersion: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toTrackerRow);
}

export async function createApplicationFromJob(jobId: string) {
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
  if (!job) throw new Error("Job not found");
  const latestResume = await prisma.resumeVersion.findFirst({
    where: { jobId, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const existing = await prisma.application.findFirst({
    where: { jobId, userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    // Refresh smart fields if still sparse
    return prisma.application.update({
      where: { id: existing.id },
      data: {
        resumeVersionId: latestResume?.id ?? existing.resumeVersionId,
        companyName: existing.companyName || job.company,
        positionTitle: existing.positionTitle || job.title,
        website: existing.website || job.url,
        locationApplied: existing.locationApplied || job.location,
        workSetting: existing.workSetting || remoteLabel(job.remoteType),
        salaryAsked: existing.salaryAsked || salaryFromJob(job),
        submittedAt: existing.submittedAt ?? new Date(),
        status: existing.status === "review_required" ? "applied" : existing.status,
        statusTagsJson:
          existing.statusTagsJson === "[]" || !existing.statusTagsJson
            ? JSON.stringify(["Applied"])
            : existing.statusTagsJson,
      },
    });
  }

  const maxSort = await prisma.application.aggregate({
    where: { userId: user.id },
    _max: { sortOrder: true },
  });

  const app = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: job.id,
      resumeVersionId: latestResume?.id,
      status: "applied",
      statusTagsJson: JSON.stringify(["Applied"]),
      nextActionsJson: JSON.stringify([]),
      submittedAt: new Date(),
      submissionChannel: "manual",
      companyName: job.company,
      positionTitle: job.title,
      website: job.url,
      locationApplied: job.location,
      workSetting: remoteLabel(job.remoteType),
      salaryAsked: salaryFromJob(job),
      followUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  await prisma.job.update({ where: { id: jobId }, data: { status: "applied" } });
  return app;
}

export async function createBlankApplication() {
  const user = await getPrimaryUser();
  const maxSort = await prisma.application.aggregate({
    where: { userId: user.id },
    _max: { sortOrder: true },
  });

  return prisma.application.create({
    data: {
      userId: user.id,
      status: "applied",
      statusTagsJson: JSON.stringify(["Applied"]),
      nextActionsJson: JSON.stringify([]),
      companyName: "New company",
      positionTitle: "",
      submittedAt: new Date(),
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
}

export type ApplicationPatch = {
  companyName?: string | null;
  positionTitle?: string | null;
  statusTags?: string[];
  nextActions?: string[];
  submittedAt?: string | null; // yyyy-mm-dd
  salaryAsked?: string | null;
  website?: string | null;
  recruiterName?: string | null;
  referenceLink?: string | null;
  locationApplied?: string | null;
  workSetting?: string | null;
  notes?: string | null;
};

export async function patchApplication(id: string, patch: ApplicationPatch) {
  const { app } = await (await import("@/lib/auth/ownership")).requireOwnedApplication(id);
  void app;
  const data: Record<string, unknown> = {};
  if ("companyName" in patch) data.companyName = patch.companyName;
  if ("positionTitle" in patch) data.positionTitle = patch.positionTitle;
  if ("salaryAsked" in patch) data.salaryAsked = patch.salaryAsked;
  if ("website" in patch) data.website = patch.website;
  if ("recruiterName" in patch) data.recruiterName = patch.recruiterName;
  if ("referenceLink" in patch) data.referenceLink = patch.referenceLink;
  if ("locationApplied" in patch) data.locationApplied = patch.locationApplied;
  if ("workSetting" in patch) data.workSetting = patch.workSetting;
  if ("notes" in patch) data.notes = patch.notes;
  if (patch.statusTags) {
    data.statusTagsJson = JSON.stringify(patch.statusTags);
    data.status = primaryTagToStatus(patch.statusTags);
  }
  if (patch.nextActions) {
    data.nextActionsJson = JSON.stringify(patch.nextActions);
  }
  if ("submittedAt" in patch) {
    data.submittedAt = patch.submittedAt ? new Date(patch.submittedAt) : null;
  }

  return prisma.application.update({ where: { id }, data });
}

export async function reorderApplications(orderedIds: string[]) {
  const user = await getPrimaryUser();
  const owned = await prisma.application.findMany({
    where: { userId: user.id, id: { in: orderedIds } },
    select: { id: true },
  });
  const ownedSet = new Set(owned.map((a) => a.id));
  const safe = orderedIds.filter((id) => ownedSet.has(id));
  await prisma.$transaction(
    safe.map((id, index) =>
      prisma.application.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );
}

export async function deleteApplication(id: string) {
  await (await import("@/lib/auth/ownership")).requireOwnedApplication(id);
  return prisma.application.delete({ where: { id } });
}
