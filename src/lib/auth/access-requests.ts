import { prisma } from "@/lib/db/prisma";
import { appBaseUrl, operatorNotifyEmail, sendEmail } from "@/lib/notifications/email";
import { createInvite } from "@/lib/auth/invites";

export async function listPendingAccessRequests(limit = 50) {
  return prisma.accessRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function notifyOperatorOfAccessRequest(input: {
  email: string;
  firstName: string;
  searchingFor: string;
  note: string;
}) {
  const operatorEmail = operatorNotifyEmail();
  if (!operatorEmail) return { ok: false, skipped: true as const };

  const loginUrl = `${appBaseUrl()}/settings`;
  return sendEmail({
    to: operatorEmail,
    subject: `CareerOS access request — ${input.firstName}`,
    text: [
      `${input.firstName} (${input.email}) requested access to CareerOS.`,
      input.searchingFor ? `Looking for: ${input.searchingFor}` : "",
      input.note ? `Note: ${input.note}` : "",
      "",
      `Review and invite from Settings: ${loginUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function inviteFromAccessRequest(accessRequestId: string, operatorUserId: string) {
  const row = await prisma.accessRequest.findUnique({ where: { id: accessRequestId } });
  if (!row) throw new Error("Access request not found");
  if (row.status !== "pending") throw new Error("Request already handled");

  await createInvite({ email: row.email, createdById: operatorUserId });
  await prisma.accessRequest.update({
    where: { id: row.id },
    data: { status: "invited" },
  });

  const loginUrl = `${appBaseUrl()}/login`;
  await sendInviteAcceptedEmail({
    email: row.email,
    firstName: row.firstName,
    loginUrl,
  });

  return row;
}

export async function sendInviteAcceptedEmail(input: {
  email: string;
  firstName: string;
  loginUrl: string;
}) {
  return sendEmail({
    to: input.email,
    subject: "You're invited to CareerOS",
    text: [
      `Hi ${input.firstName},`,
      "",
      "Your CareerOS beta access is ready.",
      "",
      `Sign in here: ${input.loginUrl}`,
      "",
      "Use this same email address. Google sign-in or magic link both work — request the link on the login page (not from Supabase).",
      "",
      "You'll get your own isolated workspace.",
    ].join("\n"),
  });
}

export async function dismissAccessRequest(accessRequestId: string) {
  await prisma.accessRequest.update({
    where: { id: accessRequestId },
    data: { status: "dismissed" },
  });
}
