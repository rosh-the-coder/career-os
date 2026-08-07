import { useState } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useReducedMotionFlag } from "@/lib/motion";

type Node = { id: string; label: string };

export function WorkflowLoop({
  nodes,
}: {
  nodes: Node[];
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionFlag();

  if (reduced || typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    // mobile / reduced: vertical list — checked at render; also provide always-visible list for a11y
  }

  return (
    <section className="section-pin" aria-label="Daily job-search loop">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="relative mx-auto hidden h-[420px] w-[420px] md:block">
          {nodes.map((n, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 38;
            const y = 50 + Math.sin(angle) * 38;
            const style: CSSProperties = { left: `${x}%`, top: `${y}%` };
            return (
              <button
                key={n.id}
                type="button"
                style={style}
                onClick={() => setActive(i)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs transition ${
                  active === i
                    ? "border-signal bg-signal/20 text-signal"
                    : "border-line bg-panel text-muted hover:text-ink"
                }`}
              >
                {n.label}
              </button>
            );
          })}
          <motion.div
            className="absolute inset-[28%] rounded-full border border-dashed border-line"
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          />
        </div>
        <ol className="mt-8 space-y-2 md:mt-10">
          {nodes.map((n, i) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`w-full rounded-md border px-4 py-3 text-left text-sm ${
                  active === i ? "border-signal/50 bg-signal/10 text-ink" : "border-line text-muted"
                }`}
              >
                <span className="mono mr-3 text-faint">{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
