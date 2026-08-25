export function CareerProfilePreview({
  name,
  markets,
  roles,
  experienceCount,
  projectCount,
  skillCount,
  resumeCount,
  completeness,
  hasLlm,
}: {
  name: string;
  markets: string[];
  roles: string;
  experienceCount: number;
  projectCount: number;
  skillCount: number;
  resumeCount: number;
  completeness: number;
  hasLlm: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Career profile</div>
      <div className="mt-2 font-display text-xl text-ink">{name || "Your name"}</div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-mono text-[10px] text-ink-faint">Experience</div>
          <div className="text-ink">{experienceCount}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-ink-faint">Projects</div>
          <div className="text-ink">{projectCount}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-ink-faint">Skills</div>
          <div className="text-ink">{skillCount}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-ink-faint">Resumes</div>
          <div className="text-ink">{resumeCount}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-mono text-[10px] text-ink-faint">Markets</div>
        <p className="mt-1 text-sm text-ink-muted">{markets.length ? markets.join(" · ") : "—"}</p>
      </div>
      <div className="mt-3">
        <div className="font-mono text-[10px] text-ink-faint">Direction</div>
        <p className="mt-1 text-sm text-ink-muted">{roles || "—"}</p>
      </div>
      <div className="mt-3">
        <div className="font-mono text-[10px] text-ink-faint">AI provider</div>
        <p className="mt-1 text-sm text-ink-muted">{hasLlm ? "Connected" : "Not connected"}</p>
      </div>
      <div className="mt-5">
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>Completeness</span>
          <span className="font-mono">{completeness}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${completeness}%` }} />
        </div>
      </div>
    </div>
  );
}
