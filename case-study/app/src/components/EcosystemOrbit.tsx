import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionFlag } from "@/lib/motion";

type Node = { id: string; label: string; category?: string; tooltip?: string };

export function EcosystemOrbit({
  nodes,
  thesis,
  sliceLine,
}: {
  nodes: Node[];
  thesis: string;
  sliceLine: string;
}) {
  const reduced = useReducedMotionFlag();
  const orbit = useMemo(() => nodes.filter((n) => n.id !== "center"), [nodes]);
  const [selected, setSelected] = useState<string | null>(null);
  const [bounce, setBounce] = useState(false);

  return (
    <section className="section-pin" aria-label="Existing landscape">
      <div className="mx-auto w-full max-w-5xl px-4">
        <p className="mb-8 text-center text-muted">{sliceLine}</p>
        <div className="relative mx-auto hidden aspect-square max-w-xl md:block">
          <motion.div
            className="absolute inset-0"
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
          >
            {orbit.map((n, i) => {
              const angle = (i / orbit.length) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * 40;
              const y = 50 + Math.sin(angle) * 40;
              return (
                <button
                  key={n.id}
                  type="button"
                  title={n.tooltip}
                  onClick={() => setSelected(n.id)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-panel px-3 py-2 text-xs text-ink hover:border-signal/50"
                >
                  {n.label}
                </button>
              );
            })}
          </motion.div>
          <button
            type="button"
            onClick={() => {
              setBounce(true);
              setTimeout(() => setBounce(false), 450);
            }}
            className={`absolute top-1/2 left-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-signal/50 bg-canvas text-center text-xs text-signal ${
              bounce ? "animate-pulse" : ""
            }`}
          >
            Workflow
            <br />
            (empty)
          </button>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 md:hidden">
          {orbit.map((n) => (
            <li key={n.id} className="rounded-md border border-line bg-panel px-3 py-2 text-sm">
              <span className="text-ink">{n.label}</span>
              {n.tooltip ? <span className="mt-1 block text-xs text-faint">{n.tooltip}</span> : null}
            </li>
          ))}
        </ul>
        {selected ? (
          <p className="mt-6 text-center text-sm text-muted" aria-live="polite">
            {orbit.find((n) => n.id === selected)?.tooltip}
          </p>
        ) : null}
        <h3 className="display mt-12 text-center text-3xl text-ink md:text-5xl">{thesis}</h3>
      </div>
    </section>
  );
}
