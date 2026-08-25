import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { isDevAuthBypass, getOperatorEmails, isEmailAllowedSync } from "@/lib/auth/supabase";
import { isEmailAuthorized, markInviteUsed } from "@/lib/auth/invites";
import { CASE_STUDY_USER_EMAIL, isCaseStudyMode } from "@/lib/case-study/mode";
import { neutralSettingsCreate } from "@/lib/onboarding/defaults";

/**
 * Resolves the app user for the *current* Supabase session only.
 * Never falls back to “first user in the database”.
 * Operator email aliases may share one inventory — strangers never do.
 */
export async function getPrimaryUser() {
  if (isCaseStudyMode()) {
    const demo = await prisma.user.findUnique({
      where: { email: CASE_STUDY_USER_EMAIL },
      include: { settings: true },
    });
    if (!demo) {
      throw new Error(
        "Case-study mode is on but demo user is missing. Run: npm run seed:case-study",
      );
    }
    return demo;
  }

  if (isDevAuthBypass()) {
    const user = await prisma.user.findFirst({
      where: { NOT: { email: CASE_STUDY_USER_EMAIL } },
      include: { settings: true },
      orderBy: { createdAt: "asc" },
    });
    if (!user) throw new Error("No user seeded. Run npm run db:seed");
    if (!user.isOperator) {
      return prisma.user.update({
        where: { id: user.id },
        data: {
          isOperator: true,
          onboardingStatus: "complete",
          onboardingStep: "done",
          completenessScore: Math.max(user.completenessScore, 100),
        },
        include: { settings: true },
      });
    }
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

  const email = authUser.email.toLowerCase();
  const operatorEmails = getOperatorEmails();
  const isOperatorEmail = operatorEmails.includes(email);

  // 1) Exact auth identity match (preferred) — skip invite DB round-trip when already linked
  let user = await prisma.user.findFirst({
    where: { authUserId: authUser.id },
    include: { settings: true },
  });

  if (user) {
    if (isOperatorEmail && !user.isOperator) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isOperator: true,
          onboardingStatus: "complete",
          onboardingStep: "done",
        },
        include: { settings: true },
      });
    }
    return user;
  }

  if (!(await isEmailAuthorized(email))) {
    throw new Error("Email not invited or allowlisted for CareerOS");
  }

  // 2) Email match only when authUserId is unset OR already this identity
  {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      include: { settings: true },
    });
    if (byEmail) {
      if (byEmail.authUserId && byEmail.authUserId !== authUser.id) {
        throw new Error(
          "This email is already linked to a different sign-in identity. Sign out and use the original account, or contact the operator.",
        );
      }
      user = byEmail;
    }
  }

  if (!user) {
    // Operator aliases (explicit OPERATOR_EMAILS only) share one seeded inventory.
    if (isOperatorEmail) {
      const seededOperator = await prisma.user.findFirst({
        where: {
          OR: [{ isOperator: true }, { email: { in: operatorEmails } }],
        },
        include: { settings: true },
        orderBy: { createdAt: "asc" },
      });
      if (seededOperator) {
        // Refuse to steal the row if another non-alias auth identity owns it
        if (
          seededOperator.authUserId &&
          seededOperator.authUserId !== authUser.id &&
          !operatorEmails.includes(seededOperator.email.toLowerCase())
        ) {
          throw new Error("Operator profile is linked to another identity.");
        }
        user = await prisma.user.update({
          where: { id: seededOperator.id },
          data: {
            authUserId: authUser.id,
            isOperator: true,
            onboardingStatus: "complete",
            onboardingStep: "done",
          },
          include: { settings: true },
        });
        return user;
      }
    }

    // Everyone else: isolated empty workspace
    const displayName =
      (authUser.user_metadata?.full_name as string | undefined)?.trim() ||
      email.split("@")[0] ||
      "New user";
    user = await prisma.user.create({
      data: {
        email,
        name: displayName,
        authUserId: authUser.id,
        isOperator: isOperatorEmail,
        onboardingStatus: isOperatorEmail ? "complete" : "pending",
        onboardingStep: isOperatorEmail ? "done" : "basics",
        completenessScore: isOperatorEmail ? 100 : 0,
        settings: { create: isOperatorEmail ? {} : neutralSettingsCreate() },
      },
      include: { settings: true },
    });
    await markInviteUsed(email);
    return user;
  }

  if (!user.authUserId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        authUserId: authUser.id,
        isOperator: user.isOperator || isOperatorEmail,
      },
      include: { settings: true },
    });
  } else if (user.authUserId !== authUser.id) {
    throw new Error("Session identity does not match this workspace.");
  }

  return user;
}

/** Sync allowlist check for middleware (invites checked async separately). */
export { isEmailAllowedSync };
