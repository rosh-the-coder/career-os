import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="font-display text-xl text-ink">CareerOS</div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            Invite-only beta · 2026
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-ink-muted" aria-label="Footer">
          <Link href="/#how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/request-access" className="hover:text-ink">
            Request access
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <span className="text-ink-faint" title="Privacy policy coming with public launch">
            Privacy
          </span>
        </nav>
      </div>
    </footer>
  );
}
