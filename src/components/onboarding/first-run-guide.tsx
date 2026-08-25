"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runDiscoveryAction } from "@/app/actions";
import { track } from "@/lib/analytics/events";

type Sample = { title: string; company: string; score: number; category: string };

export function FirstRunGuide() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    track("first_discovery_started");
  }, []);

  function run() {
    setPhase("running");
    setMessage("Finding roles…");
    start(async () => {
      const result = await runDiscoveryAction();
      if (!result.ok) {
        setPhase("error");
        setMessage(result.error ?? "Discovery failed. You can try again from the dashboard.");
        return;
      }
      const ie = result.irelandCoreAdded ?? 0;
      const eu = result.euSponsorshipAdded ?? 0;
      const total = ie + eu;
      setAdded(total);
      setSamples(result.samples?.slice(0, 3) ?? []);
      setPhase("done");
      if (total === 0) {
        setMessage(
          "No matching roles this run. Public boards CareerOS scrapes are mostly tech/product titles — if your targets are retail/hospitality/etc., use Import a job with a listing URL, or add Adzuna keys and broaden titles. Nothing is wrong with your profile.",
        );
      } else {
        setMessage(`CareerOS found ${total} role${total === 1 ? "" : "s"}.`);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-16">
      <div className="font-mono text-[10px] uppercase tracking-wider text-accent">First search</div>
      <h1 className="mt-2 font-display text-3xl text-ink">Start with roles worth evaluating</h1>
      <p className="mt-3 text-sm text-ink-muted">
        CareerOS will run discovery against your markets and target roles. Counts are real — nothing is
        invented for the demo.
      </p>

      {phase === "idle" ? (
        <button
          type="button"
          onClick={run}
          className="mt-8 rounded-md bg-accent px-5 py-3 text-sm font-medium text-canvas"
        >
          Find roles now
        </button>
      ) : null}

      {phase === "running" || pending ? (
        <p className="mt-8 font-mono text-sm text-accent" role="status" aria-live="polite">
          Finding roles…
        </p>
      ) : null}

      {phase === "error" ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-warn" role="alert">
            {message}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={run}
              className="rounded-md border border-line px-4 py-2 text-sm text-ink"
            >
              Try again
            </button>
            <Link href="/dashboard?firstrun=1" className="rounded-md bg-accent px-4 py-2 text-sm text-canvas">
              Go to dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-ink" role="status" aria-live="polite">
            {message}
          </p>
          {samples.length > 0 ? (
            <ul className="space-y-2 rounded-xl border border-line bg-panel p-4">
              {samples.map((s) => (
                <li key={`${s.title}-${s.company}`} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="text-ink">{s.title}</span>
                    <span className="text-ink-muted"> · {s.company}</span>
                  </span>
                  <span className="font-mono text-accent">{s.score}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm text-ink-muted">
            Next: open your Approve queue to review fit explanations. CareerOS prepares — you decide
            whether to apply.
          </p>
          <div className="flex flex-wrap gap-3">
            {added > 0 ? (
              <Link
                href="/approve"
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas"
                onClick={() => track("first_job_reviewed")}
              >
                Open Approve queue
              </Link>
            ) : (
              <Link href="/jobs/new" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
                Import a job
              </Link>
            )}
            <button
              type="button"
              className="rounded-md border border-line px-4 py-2 text-sm text-ink"
              onClick={() => router.push("/dashboard?firstrun=1")}
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
