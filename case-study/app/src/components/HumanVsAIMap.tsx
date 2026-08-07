import { useState } from "react";
import data from "@diagrams/human-vs-ai.json";

export function HumanVsAIMap({ headline }: { headline?: string }) {
  const nodes = data.nodes as { id: string; label: string; owner: string }[];
  const [llm, setLlm] = useState(true);

  const groups = {
    deterministic: nodes.filter((n) => n.owner === "deterministic" || n.owner === "human+rules"),
    "optional-ai": nodes.filter((n) => n.owner === "optional-ai"),
    human: nodes.filter((n) => n.owner === "human"),
  };

  return (
    <section className="section-pin" aria-label="Human versus AI decisions">
      <div className="mx-auto w-full max-w-5xl px-4">
        {headline ? (
          <h3 className="display mb-10 text-center text-3xl text-ink md:text-4xl">{headline}</h3>
        ) : null}
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => setLlm((v) => !v)}
            className="rounded-md border border-line px-4 py-2 text-sm text-muted"
            aria-pressed={llm}
          >
            LLM periphery: {llm ? "on" : "off"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["deterministic", "Deterministic"],
              ["optional-ai", "Optional AI"],
              ["human", "Human only"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className={`rounded-xl border border-line bg-panel/50 p-4 ${
                key === "optional-ai" && !llm ? "opacity-40" : ""
              }`}
            >
              <p className="mono mb-3 text-[11px] tracking-wider text-signal uppercase">{label}</p>
              <ul className="space-y-2 text-sm text-muted">
                {groups[key].map((n) => (
                  <li key={n.id}>{n.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
