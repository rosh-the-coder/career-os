import evidence from "@diagrams/evidence-to-resume.json";

export function EvidencePipeline() {
  const nodes = evidence.nodes as { id: string; label: string }[];
  return (
    <section className="mx-auto max-w-4xl px-4 py-20" aria-label="Evidence to resume">
      <ol className="space-y-3">
        {nodes.map((n, i) => (
          <li
            key={n.id}
            className="flex items-center gap-4 rounded-lg border border-line bg-panel/40 px-4 py-3"
          >
            <span className="mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm text-ink">{n.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
