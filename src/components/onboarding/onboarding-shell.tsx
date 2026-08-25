import Link from "next/link";

const STAGES = [
  { id: "welcome", label: "Welcome" },
  { id: "basics", label: "You" },
  { id: "evidence", label: "History" },
  { id: "direction", label: "Direction" },
  { id: "tools", label: "Tools" },
  { id: "review", label: "Review" },
] as const;

export function OnboardingShell({
  stage,
  completeness,
  children,
  preview,
}: {
  stage: string;
  completeness: number;
  children: React.ReactNode;
  preview?: React.ReactNode;
}) {
  const idx = Math.max(
    0,
    STAGES.findIndex((s) => s.id === stage),
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/dashboard" className="font-display text-xl text-ink">
            CareerOS
          </Link>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Setup · ~10–15 min
            </div>
            <div className="font-mono text-xs text-ink-muted">{completeness}% complete</div>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3 md:px-8"
          aria-label="Onboarding progress"
        >
          {STAGES.map((s, i) => (
            <Link
              key={s.id}
              href={`/onboarding?stage=${s.id}`}
              className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                i === idx
                  ? "bg-accent/15 text-accent"
                  : i < idx
                    ? "text-ink-muted"
                    : "text-ink-faint"
              }`}
              aria-current={i === idx ? "step" : undefined}
            >
              {i + 1}. {s.label}
            </Link>
          ))}
        </nav>
        <div className="h-0.5 bg-panel-2">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${((idx + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div>{children}</div>
        <aside className="md:sticky md:top-24 md:self-start">
          {preview ?? (
            <div className="rounded-xl border border-line bg-panel p-5 text-sm text-ink-muted">
              CareerOS uses this setup to filter roles, explain fit, and compose evidence-grounded
              résumés. You can refine everything later in Settings and Profiles.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export { STAGES as ONBOARDING_STAGES };
