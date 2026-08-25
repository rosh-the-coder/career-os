import Link from "next/link";
import { headers } from "next/headers";
import { SidebarNav, MobileNav } from "@/components/sidebar-nav";
import { isDevAuthBypass, isSupabaseConfigured } from "@/lib/auth/supabase";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { prisma } from "@/lib/db/prisma";
import { CASE_STUDY_USER_EMAIL, isCaseStudyMode } from "@/lib/case-study/mode";

const AUTH_SURFACE = ["/login", "/auth/callback", "/auth/signout", "/request-access"];

function isBarePath(pathname: string): boolean {
  if (!pathname) return false; // fail open — show app chrome if header missing
  if (pathname === "/") return true;
  if (pathname.startsWith("/onboarding")) return true;
  return AUTH_SURFACE.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function resolveAccountLabel(): Promise<{
  email: string | null;
  name: string | null;
  bypass: boolean;
}> {
  const bypass = isDevAuthBypass();

  if (isCaseStudyMode()) {
    return { email: CASE_STUDY_USER_EMAIL, name: "Case study", bypass };
  }

  if (bypass) {
    const seeded = await prisma.user.findFirst({
      where: { NOT: { email: CASE_STUDY_USER_EMAIL } },
      orderBy: { createdAt: "asc" },
      select: { email: true, name: true },
    });
    return {
      email: seeded?.email ?? null,
      name: seeded?.name ?? null,
      bypass: true,
    };
  }

  if (!isSupabaseConfigured()) {
    return { email: null, name: null, bypass: false };
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { email: null, name: null, bypass: false };
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { email: null, name: null, bypass: false };

    const appUser = await prisma.user.findFirst({
      where: {
        OR: [{ authUserId: user.id }, { email: user.email.toLowerCase() }],
      },
      select: { name: true, email: true },
    });

    return {
      email: user.email,
      name: appUser?.name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
      bypass: false,
    };
  } catch {
    return { email: null, name: null, bypass: false };
  }
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  // Landing, login, request-access, onboarding: no authenticated app chrome
  if (isBarePath(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  const account = await resolveAccountLabel();
  const signedIn = Boolean(account.email);

  const accountBlock = (
    <div className="space-y-2">
      {account.bypass ? (
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-warn">Dev auth bypass</div>
          <Link href="/login" className="block text-sm text-accent hover:underline">
            Sign in for real
          </Link>
        </div>
      ) : null}

      {signedIn && !account.bypass ? (
        <div className="space-y-2">
          {account.name ? (
            <div className="truncate text-sm font-medium text-ink">{account.name}</div>
          ) : null}
          <div className="truncate font-mono text-[10px] text-ink-muted" title={account.email ?? ""}>
            {account.email}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-left text-sm text-ink hover:border-accent/40 hover:text-accent"
            >
              Sign out
            </button>
          </form>
          <Link href="/login" className="block text-xs text-ink-faint hover:text-ink">
            Switch account
          </Link>
        </div>
      ) : !account.bypass ? (
        <Link href="/login" className="text-sm text-accent hover:underline">
          Sign in
        </Link>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-8 px-4 py-6 md:px-8">
      {/* Sticky viewport rail: brand + nav pinned top, account pinned bottom */}
      <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-52 shrink-0 flex-col self-start md:flex">
        <Link href="/dashboard" className="mb-8 block shrink-0">
          <div className="font-display text-2xl tracking-tight text-ink">CareerOS</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Targeted Job Hunter
          </div>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="mt-4 shrink-0 space-y-3 border-t border-line pt-4">
          {accountBlock}
          <div className="font-mono text-[11px] text-ink-faint">Evidence before generation</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 space-y-3 border-b border-line pb-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="font-display text-xl text-ink">
              CareerOS
            </Link>
            {signedIn && !account.bypass ? (
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-md border border-line px-3 py-1.5 text-sm text-ink">
                  Sign out
                </button>
              </form>
            ) : (
              <Link href="/login" className="text-sm text-accent">
                Sign in
              </Link>
            )}
          </div>
          {signedIn ? (
            <div className="truncate font-mono text-[10px] text-ink-faint">{account.email}</div>
          ) : null}
          <MobileNav />
        </div>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
