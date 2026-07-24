import Link from "next/link";
import { isDevAuthBypass } from "@/lib/auth/supabase";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/jobs/new", label: "Import" },
  { href: "/profiles", label: "Profiles" },
  { href: "/resume-studio", label: "Resume Studio" },
  { href: "/applications", label: "Applications" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const bypass = isDevAuthBypass();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-6 md:px-8">
      <aside className="hidden w-52 shrink-0 flex-col md:flex">
        <Link href="/dashboard" className="mb-10 block">
          <div className="font-display text-2xl tracking-tight text-ink">CareerOS</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Targeted Job Hunter
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-panel-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
