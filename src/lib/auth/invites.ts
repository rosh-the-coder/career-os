import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_TTL_DAYS = 14;

export async function createInvite(opts: {
  email: string;
  createdById: string;
  ttlDays?: number;
}) {
  const email = opts.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + (opts.ttlDays ?? DEFAULT_TTL_DAYS) * 86400000);
  return prisma.invite.create({
    data: {
      email,
      token,
      createdById: opts.createdById,
      expiresAt,
    },
  });
}

export async function listInvites(createdById: string) {
  return prisma.invite.findMany({
    where: { createdById },
    orderBy: { createdAt: "desc" },
  });
}

export async function hasValidInvite(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  const row = await prisma.invite.findFirst({
    where: {
      email: e,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  return Boolean(row);
}

export async function markInviteUsed(email: string) {
  const e = email.trim().toLowerCase();
  await prisma.invite.updateMany({
    where: { email: e, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export async function isEmailAuthorized(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;
  const lower = email.toLowerCase();
  const { getAllowedEmails } = await import("@/lib/auth/supabase");
  if (getAllowedEmails().includes(lower)) return true;
  // Returning users who already have an isolated workspace row
  const existing = await prisma.user.findUnique({
    where: { email: lower },
    select: { id: true, authUserId: true },
  });
  if (existing) return true;
  return hasValidInvite(lower);
}
