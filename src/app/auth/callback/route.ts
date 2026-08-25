import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { isEmailAuthorized } from "@/lib/auth/invites";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error") || searchParams.get("error_code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=auth&reason=oauth_provider`);
  }

  if (!code) {
    // No code and no error — do not dump into dashboard on a stale session assumption.
    return NextResponse.redirect(`${origin}/login?error=auth&reason=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    await supabase.auth.signOut().catch(() => undefined);
    return NextResponse.redirect(`${origin}/login?error=auth&reason=exchange`);
  }

  if (!(await isEmailAuthorized(data.user.email))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=unauthorized`);
  }

  try {
    const { getPrimaryUser } = await import("@/lib/auth/user");
    const appUser = await getPrimaryUser();
    if (!appUser.isOperator && appUser.onboardingStatus !== "complete") {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  } catch {
    await supabase.auth.signOut().catch(() => undefined);
    return NextResponse.redirect(`${origin}/login?error=auth&reason=workspace`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
