export function CareerInventoryPreview() {
  const completeness = 82;
  const stats = [
    { label: "Experience", value: 4 },
    { label: "Projects", value: 7 },
    { label: "Skills", value: 31 },
    { label: "Verified metrics", value: 8 },
    { label: "Evidence items", value: 24 },
  ] as const;

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-4 md:px-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Career inventory
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <span className="text-sm text-ink-muted">Profile completeness</span>
            <span className="font-display text-3xl text-accent">{completeness}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-accent" style={{ width: `${completeness}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-canvas px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                {s.label}
              </div>
              <div className="mt-1 font-display text-2xl text-ink">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-2 md:p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Target roles
            </div>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              <li>UX Engineer</li>
              <li>AI Product Engineer</li>
              <li>Product Designer</li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Markets</div>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              <li>Ireland</li>
              <li>EU</li>
              <li>Remote Europe</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["Experience", "Projects", "Skills", "Metrics", "Eligibility"].map((c) => (
          <span
            key={c}
            className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
