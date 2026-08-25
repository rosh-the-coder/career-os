import { prisma } from "@/lib/db/prisma";
import { getPrimaryUser } from "@/lib/auth/user";

export class OwnershipError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "OwnershipError";
  }
}

export async function requireOwnedJob(jobId: string) {
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
    include: { score: { include: { profile: true } }, resumeVersions: { orderBy: { createdAt: "desc" } } },
  });
  if (!job) throw new OwnershipError("Job not found");
  return { user, job };
}

export async function assertOwnedJobId(jobId: string) {
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
    select: { id: true, userId: true },
  });
  if (!job) throw new OwnershipError("Job not found");
  return { user, job };
}

export async function requireOwnedResume(resumeId: string) {
  const user = await getPrimaryUser();
  const version = await prisma.resumeVersion.findFirst({
    where: { id: resumeId, userId: user.id },
    include: { profile: true, job: true, user: { include: { settings: true } } },
  });
  if (!version) throw new OwnershipError("Resume not found");
  return { user, version };
}

export async function requireOwnedApplication(applicationId: string) {
  const user = await getPrimaryUser();
  const app = await prisma.application.findFirst({
    where: { id: applicationId, userId: user.id },
  });
  if (!app) throw new OwnershipError("Application not found");
  return { user, app };
}
