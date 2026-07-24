import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { isDevAuthBypass, isEmailAllowed } from "@/lib/auth/supabase";

/**
 * Resolves the app user:
 * - DEV_BYPASS_AUTH → first seeded user
 * - Otherwise → Supabase session email mapped to Prisma User
 */
export async function getPrimaryUser() {
  if (isDevAuthBypass()) {
    const user = await prisma.user.findFirst({
      include: { settings: true },
      orderBy: { createdAt: "asc" },
    });
    if (!user) throw new Error("No user seeded. Run npm run db:seed");
    return user;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set env vars or DEV_BYPASS_AUTH=true for local.");
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new Error("Not authenticated");
  }

  if (!isEmailAllowed(authUser.email)) {
    throw new Error("Email not allowlisted for CareerOS");
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ authUserId: authUser.id }, { email: authUser.email.toLowerCase() }],
    },
    include: { settings: true },
  });

  if (!user) {
    // First login: attach auth id to the seeded profile if email matches, else create.
    const seeded = await prisma.user.findFirst({
      include: { settings: true },
      orderBy: { createdAt: "asc" },
    });

    if (seeded && seeded.email.toLowerCase() === authUser.email.toLowerCase()) {
      user = await prisma.user.update({
        where: { id: seeded.id },
        data: { authUserId: authUser.id },
        include: { settings: true },
      });
    } else if (seeded) {
      // Allowlisted alternate email (e.g. gmail) → link to primary career profile
      user = await prisma.user.update({
        where: { id: seeded.id },
        data: {
          authUserId: authUser.id,
          // keep canonical career email on the profile; auth email is linked via authUserId
        },
        include: { settings: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: authUser.email.toLowerCase(),
          name: authUser.user_metadata?.full_name ?? "Roshan Najar",
          authUserId: authUser.id,
          settings: { create: {} },
        },
        include: { settings: true },
      });
    }
  } else if (!user.authUserId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { authUserId: authUser.id },
      include: { settings: true },
    });
  }

  return user;
}
