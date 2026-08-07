import { useState } from "react";

export function PrincipleGate({
  title,
  mode,
}: {
  title: string;
  mode: "evidence" | "human" | "title";
}) {
  const [ok, setOk] = useState(false);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-4">
      <h3 className="display text-center text-3xl text-ink md:text-4xl">{title}</h3>
      {mode === "evidence" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setOk(false)}
            className="rounded-md border border-line px-3 py-2 text-sm text-muted"
          >
            Claim
          </button>
          <span className="text-faint">→</span>
          <button
            type="button"
            onClick={() => setOk(true)}
            className="rounded-md border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal"
          >
            Dock evidence
          </button>
          <p className="w-full text-center text-sm text-muted" aria-live="polite">
            {ok ? "Claim admitted." : "Blocked until evidence docks."}
          </p>
        </div>
      ) : null}
      {mode === "human" ? (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!ok}
            className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-40"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setOk(true)}
            className="text-sm text-signal underline-offset-2 hover:underline"
          >
            Review
          </button>
          <p className="text-sm text-muted">{ok ? "Unlocked after review." : "Submit stays locked."}</p>
        </div>
      ) : null}
      {mode === "title" ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setOk(true);
              setTimeout(() => setOk(false), 500);
            }}
            className="rounded-md border border-line px-4 py-2 font-mono text-sm"
          >
            {ok ? "Senior Staff Engineer ✕" : "Official title preserved"}
          </button>
          <p className="mt-3 text-sm text-muted">Invented titles snap back.</p>
        </div>
      ) : null}
    </section>
  );
}
