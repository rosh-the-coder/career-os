import { EstimateTooltip, PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const user = await prisma.user.findFirst({
    include: {
      careerProfiles: { orderBy: { name: "asc" } },
      experiences: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      evidenceItems: { include: { metrics: true }, orderBy: { title: "asc" } },
      skills: { orderBy: [{ category: "asc" }, { name: "asc" }] },
    },
  });

  if (!user) {
    return <p className="text-ink-muted">No seed data. Run npm run db:seed</p>;
  }

  return (
    <div>
      <PageHeader
        title="Career profiles"
        description="Five positioning variants over one verified evidence base. Default bias: UX Engineer."
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {user.careerProfiles.map((p) => (
          <Panel key={p.id} className={p.isDefault ? "border-accent/40" : undefined}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl">{p.name}</h2>
              {p.isDefault ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">Default</span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.positioning}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {parseJsonArray<string>(p.keywordsJson).map((k) => (
                <span key={k} className="rounded border border-line bg-panel-2 px-2 py-0.5 text-xs text-ink-muted">
                  {k}
                </span>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <PageHeader title="Evidence inventory" description="Source of truth for all generated claims." />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Experience</h2>
          <ul className="mt-4 space-y-4">
            {user.experiences.map((e) => (
              <li key={e.id} className="border-b border-line pb-4 last:border-0">
                <div className="font-medium">{e.umbrellaTitle}</div>
                <div className="text-sm text-ink-muted">
                  {e.company} · {e.startDate} – {e.endDate ?? "Present"}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display text-xl">Projects</h2>
          <ul className="mt-4 space-y-4">
            {user.projects.map((p) => (
              <li key={p.id} className="border-b border-line pb-4 last:border-0">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-ink-muted">
                  {p.primaryRole} · {p.status}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mb-8">
        <h2 className="font-display text-xl">Metrics</h2>
        <ul className="mt-4 divide-y divide-line">
          {user.evidenceItems.flatMap((e) =>
            e.metrics.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="text-ink">{m.label}</span>
                  <span className="ml-2 text-ink-muted">
                    {m.valueText ?? m.value}
                    {m.unit ? ` ${m.unit}` : ""}
                  </span>
                  <div className="text-xs text-ink-faint">{e.title}</div>
                </div>
                {m.isEstimate || m.needsReview ? <EstimateTooltip label={`${m.label} needs verification`} /> : null}
              </li>
            )),
          )}
        </ul>
      </Panel>

      <Panel>
        <h2 className="font-display text-xl">Skills</h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {user.skills.map((s) => (
            <span key={s.id} className="rounded border border-line bg-panel-2 px-2 py-1 text-xs text-ink-muted">
              {s.name}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
