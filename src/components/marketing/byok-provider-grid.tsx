import { KEY_CATALOG, type KeyCatalogEntry } from "@/lib/byok/catalog";

function shortWhy(entry: KeyCatalogEntry): string {
  if (entry.provider === "gemini" || entry.provider === "openai" || entry.provider === "groq") {
    return "Scoring + résumé suggestions";
  }
  if (entry.provider === "adzuna_app_id") return "Richer job discovery";
  if (entry.provider === "brave" || entry.provider === "serpapi") {
    return "Optional board-presence signal";
  }
  return entry.tooltip.slice(0, 80);
}

function needLabel(entry: KeyCatalogEntry): string {
  if (entry.importance === "required_any_llm") return "Need one AI key";
  if (entry.importance === "recommended") return "Recommended";
  return "Optional";
}

function Card({ entry }: { entry: KeyCatalogEntry }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">
          {entry.provider === "adzuna_app_id" ? "Adzuna" : entry.label.replace("Google ", "")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {needLabel(entry)}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">{shortWhy(entry)}</p>
    </div>
  );
}

export function ByokProviderGrid() {
  const ai = KEY_CATALOG.filter((k) => ["gemini", "openai", "groq"].includes(k.provider));
  // Prefer Gemini/OpenAI display order then Groq
  const aiOrdered = [
    ...ai.filter((k) => k.provider === "gemini"),
    ...ai.filter((k) => k.provider === "openai"),
    ...ai.filter((k) => k.provider === "groq"),
  ];
  const discovery = KEY_CATALOG.filter((k) => k.provider === "adzuna_app_id");
  const signals = KEY_CATALOG.filter((k) => ["brave", "serpapi"].includes(k.provider));

  return (
    <div className="mt-8 space-y-8">
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          AI reasoning
        </div>
        <div className="grid gap-2 sm:grid-cols-3">{aiOrdered.map((e) => <Card key={e.provider} entry={e} />)}</div>
      </div>
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Discovery
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:max-w-md">
          {discovery.map((e) => (
            <Card key={e.provider} entry={e} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Optional search signals
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:max-w-lg">
          {signals.map((e) => (
            <Card key={e.provider} entry={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
