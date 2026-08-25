import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPrimaryUser } from "@/lib/auth/user";
import { isDevAuthBypass } from "@/lib/auth/supabase";

const OPEN = ["/login", "/auth", "/onboarding"];

/** Redirect guests with incomplete onboarding away from core app pages. */
export async function OnboardingGate() {
  try {
    const h = await headers();
    const path = h.get("x-pathname") || h.get("x-invoke-path") || "";
    // Next doesn't always provide path; fall through and let pages call requireOnboarded
    if (OPEN.some((p) => path.startsWith(p))) return null;
    if (isDevAuthBypass()) return null;

    const user = await getPrimaryUser();
    if (user.isOperator) return null;
    if (user.onboardingStatus !== "complete") {
      // Only redirect when we know path isn't onboarding
      if (path && !path.startsWith("/onboarding")) {
        redirect("/onboarding");
      }
    }
  } catch {
    /* unauthenticated pages */
  }
  return null;
}

export async function requireOnboarded() {
  const user = await getPrimaryUser();
  if (!user.isOperator && user.onboardingStatus !== "complete") {
    redirect("/onboarding");
  }
  return user;
}
