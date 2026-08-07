import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionFlag } from "@/lib/motion";

const DEFAULT_TOOLS = [
  { id: "resumeio", label: "Resume.io" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "word", label: "Word" },
  { id: "notion", label: "Notion" },
  { id: "email", label: "Email" },
  { id: "excel", label: "Excel" },
  { id: "pdf", label: "PDF" },
];

export function ToolPileScene({
  tools = DEFAULT_TOOLS,
  caption,
}: {
  tools?: { id: string; label: string }[];
  caption: string;
}) {
  const [count, setCount] = useState(0);
  const [looped, setLooped] = useState(false);
  const reduced = useReducedMotionFlag();
  const visible = reduced ? tools : tools.slice(0, count);
  const done = reduced || count >= tools.length;

  const add = () => {
    if (count >= tools.length) {
      setLooped(true);
      setCount(0);
      setTimeout(() => setCount(tools.length), 400);
      return;
    }
    setCount((c) => c + 1);
  };

  return (
    <section className="section-pin" aria-label="Fragmented tools">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4">
        <div className="relative flex min-h-[280px] w-full flex-wrap items-end justify-center gap-3 rounded-2xl border border-dashed border-line bg-panel/40 p-8">
          <AnimatePresence>
            {visible.map((t, i) => (
              <motion.div
                key={`${t.id}-${i}-${looped}`}
                initial={reduced ? false : { y: -80, opacity: 0, rotate: -6 }}
                animate={{ y: 0, opacity: 1, rotate: (i % 5) - 2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink shadow-lg"
              >
                {t.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {!reduced ? (
          <button
            type="button"
            onClick={add}
            className="rounded-md border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          >
            {done ? "Repeat" : "Add next tool"}
          </button>
        ) : null}
        {(done || reduced) && (
          <p className="display text-2xl text-ink md:text-3xl" aria-live="polite">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
