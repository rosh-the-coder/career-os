import { cn, formatScoreBand } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-panel/80 p-5 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function ScoreBadge({ score, rejected }: { score: number; rejected?: boolean }) {
  if (rejected) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1 font-mono text-xs text-danger">
        Rejected
      </span>
    );
  }
  const band = formatScoreBand(score);
  const tone =
    score >= 85
      ? "border-accent/40 bg-accent/10 text-accent"
      : score >= 75
        ? "border-info/40 bg-info/10 text-info"
        : score >= 65
          ? "border-warn/40 bg-warn/10 text-warn"
          : "border-line bg-panel-2 text-ink-muted";

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-xs", tone)}>
      <span className="font-medium">{score}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-80">{band}</span>
    </span>
  );
}

export function EstimateTooltip({ label }: { label?: string }) {
  return (
    <span
      className="ml-1 inline-flex cursor-help items-center rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-warn"
      title={label ?? "Estimated data — needs your review before CV use"}
    >
      Estimate · review
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-md border border-line bg-panel-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
      {status.replace(/_/g, " ")}
    </span>
  );
}
