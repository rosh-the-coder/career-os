"use client";

import { useMemo, useState } from "react";
import {
  CONTINENTS,
  LOCATION_OPTIONS,
  countriesForContinent,
  formatCustomMarketLabel,
  searchLocations,
  type ContinentId,
  type LocationOption,
} from "@/lib/onboarding/locations";
import { cn } from "@/lib/utils";

export function MarketSelector({
  name = "markets",
  defaultSelected = [],
}: {
  name?: string;
  defaultSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected.filter(Boolean));
  const [openContinent, setOpenContinent] = useState<ContinentId | null>("europe");
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => searchLocations(query, 10), [query]);

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  }

  function add(opt: LocationOption) {
    setSelected((prev) => (prev.includes(opt.label) ? prev : [...prev, opt.label]));
    setQuery("");
  }

  function addFreeform(raw: string) {
    const label = formatCustomMarketLabel(raw);
    if (!label) return;
    setSelected((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setQuery("");
  }

  const countries = openContinent ? countriesForContinent(openContinent) : [];
  const regions =
    openContinent != null
      ? LOCATION_OPTIONS.filter((o) => o.continent === openContinent && o.kind === "region")
      : [];
  const exactMatch = suggestions.some(
    (s) => s.label.toLowerCase() === query.trim().toLowerCase(),
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={selected.join(", ")} />
      <input type="hidden" name={`${name}Json`} value={JSON.stringify(selected)} />

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-ink transition-colors hover:bg-accent/20"
            >
              {label} ×
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint">Select at least one country or city/region.</p>
      )}

      <label className="block text-sm">
        <span className="text-ink-muted">Type a city, region, or country</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions[0]) add(suggestions[0]);
              else addFreeform(query);
            }
          }}
          placeholder="e.g. Delhi, Dublin, Remote Europe…"
          className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
          autoComplete="off"
        />
      </label>
      {query.trim() ? (
        <ul className="max-h-48 overflow-auto rounded-md border border-line bg-panel" role="listbox">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-panel-2"
                onClick={() => add(s)}
              >
                <span>{s.label}</span>
                <span className="font-mono text-[10px] uppercase text-ink-faint">{s.kind}</span>
              </button>
            </li>
          ))}
          {!exactMatch ? (
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-accent hover:bg-panel-2"
                onClick={() => addFreeform(query)}
              >
                <span>Add “{query.trim()}”</span>
                <span className="font-mono text-[10px] uppercase text-ink-faint">custom</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          Or browse by continent
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONTINENTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenContinent((cur) => (cur === c.id ? null : c.id))}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs",
                openContinent === c.id
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-line text-ink-muted hover:text-ink",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        {openContinent ? (
          <div className="mt-3 space-y-3 rounded-xl border border-line bg-panel/50 p-3">
            <div>
              <div className="mb-1.5 text-xs text-ink-faint">Countries</div>
              <div className="flex flex-wrap gap-1.5">
                {countries.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => add(c)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs",
                      selected.includes(c.label)
                        ? "border-accent/40 text-accent"
                        : "border-line text-ink-muted",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            {regions.length > 0 ? (
              <div>
                <div className="mb-1.5 text-xs text-ink-faint">Cities & regions</div>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => add(r)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs",
                        selected.includes(r.label)
                          ? "border-accent/40 text-accent"
                          : "border-line text-ink-muted",
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
