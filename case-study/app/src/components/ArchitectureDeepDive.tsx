import { useId, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useReducedMotionFlag } from "@/lib/motion";

export function ArchitectureDeepDive({
  title,
  preview,
  children,
}: {
  title: string;
  preview: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotionFlag();
  const panelId = useId();

  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-2 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
      >
        <span>
          <span className="block text-lg text-ink">{title}</span>
          <span className="mt-1 block text-sm text-muted">{preview}</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-faint transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-6 text-sm text-muted">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
