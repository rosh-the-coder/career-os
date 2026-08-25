"use server";

import { prisma } from "@/lib/db/prisma";
import { track } from "@/lib/analytics/events";
import { notifyOperatorOfAccessRequest } from "@/lib/auth/access-requests";
export type AccessRequestState = { ok?: boolean; error?: string; duplicate?: boolean };

export async function submitAccessRequestAction(
  _prev: AccessRequestState,
  formData: FormData,
): Promise<AccessRequestState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const searchingFor = String(formData.get("searchingFor") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!email.includes("@") || email.length < 5) {
    return { error: "Enter a valid email." };
  }
  if (!firstName) {
    return { error: "First name is required." };
  }

  const existing = await prisma.accessRequest.findFirst({
    where: { email, status: "pending" },
  });
  if (existing) {
    track("request_access_submit", { duplicate: true });
    return { ok: true, duplicate: true };
  }

  await prisma.accessRequest.create({
    data: {
      email,
      firstName,
      searchingFor: searchingFor.slice(0, 500),
      note: note.slice(0, 2000),
    },
  });

  void notifyOperatorOfAccessRequest({ email, firstName, searchingFor, note });

  track("request_access_submit", { duplicate: false });
  return { ok: true };
}
