import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import scoring from "@diagrams/scoring-breakdown.json";

export function ScoringExploder() {
  const [open, setOpen] = useState(false);
  const nodes = scoring.nodes as { id: string; label: string; weight: number }[];

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-8 px-4">
      <h3 className="display text-3xl text-ink">Transparent scoring.</h3>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-28 w-28 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-lg text-signal"
        aria-expanded={open}
      >
        Fit
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid w-full gap-2 sm:grid-cols-2 md:grid-cols-3"
          >
            {nodes.map((n) => (
              <li
                key={n.id}
                className="rounded-md border border-line bg-panel px-3 py-2 text-sm"
                style={{ opacity: 0.45 + n.weight / 40 }}
              >
                <span className="text-ink">{n.label}</span>
                <span className="mono ml-2 text-faint">{n.weight}</span>
              </li>
            ))}
          </motion.ul>
        ) : (
          <p className="text-sm text-muted">Tap the score to explode weights.</p>
        )}
      </AnimatePresence>
      <table className="sr-only">
        <caption>Score weights</caption>
        <tbody>
          {nodes.map((n) => (
            <tr key={n.id}>
              <td>{n.label}</td>
              <td>{n.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
