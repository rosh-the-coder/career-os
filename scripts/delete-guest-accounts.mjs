/**
 * Delete guest beta accounts from CareerOS + Supabase Auth.
 * Usage: node scripts/delete-guest-accounts.mjs hrishivuk@gmail.com hrishivuk2000@gmail.com
 */
import { PrismaClient } from "@prisma/client";

const emails = process.argv.slice(2).map((e) => e.trim().toLowerCase()).filter(Boolean);
if (!emails.length) {
  console.error("Usage: node scripts/delete-guest-accounts.mjs email@example.com [...]");
  process.exit(1);
}

const prisma = new PrismaClient();

async function deleteAuthUsers(authUserIds) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skipping Supabase Auth delete — set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
    return;
  }
  for (const id of authUserIds) {
    const res = await fetch(`${url}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}`, apikey: key },
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`Auth delete ${id} failed:`, res.status, body);
    } else {
      console.log(`Deleted auth user ${id}`);
    }
  }
}

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true, authUserId: true },
  });

  for (const email of emails) {
    await prisma.invite.deleteMany({ where: { email } });
    await prisma.accessRequest.deleteMany({ where: { email } });
  }

  const authIds = users.map((u) => u.authUserId).filter(Boolean);

  for (const u of users) {
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`Deleted CareerOS user ${u.email} (${u.id})`);
  }

  if (authIds.length) {
    await deleteAuthUsers(authIds);
  }

  // Auth-only rows (Google tried before CareerOS user created)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    for (const email of emails) {
      const res = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${key}`, apikey: key },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.users ?? data ?? [];
        for (const au of list) {
          if (au.id && !authIds.includes(au.id)) {
            await deleteAuthUsers([au.id]);
          }
        }
      }
    }
  }

  const remaining = await prisma.user.count({ where: { email: { in: emails } } });
  console.log(`Done. Remaining CareerOS users for targets: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
