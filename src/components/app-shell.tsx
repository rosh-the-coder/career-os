import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { isDevAuthBypass } from "@/lib/auth/supabase";

export function AppShell({ children }: { children: React.ReactNode }) {
  const bypass = isDevAuthBypass();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-8 px-4 py-6 md:px-8">
      <aside className="hidden w-52 shrink-0 flex-col md:flex">
        <Link href="/dashboard" className="mb-10 block">
          <div className="font-display text-2xl tracking-tight text-ink">CareerOS</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Targeted Job Hunter
          </div>
        </Link>
        <SidebarNav />
        <div className="mt-auto space-y-2 border-t border-line pt-4">
          {!bypass ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-left text-sm text-ink-muted hover:text-ink">
                Sign out
              </button>
            </form>
          ) : (
            <div className="font-mono text-[10px] uppercase tracking-wider text-warn">Dev auth bypass</div>
          )}
          <div className="font-mono text-[11px] text-ink-faint">Evidence before generation</div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-16">{children}</main>
    </div>
  );
}
