import { motion } from "framer-motion";
import { useReducedMotionFlag } from "@/lib/motion";

export function ActDivider({
  actNumber,
  title,
  id,
}: {
  actNumber: string;
  title: string;
  id?: string;
}) {
  const reduced = useReducedMotionFlag();
  return (
    <section
      id={id}
      className="section-pin"
      aria-labelledby={`${id || actNumber}-heading`}
    >
      <motion.div
        className="text-center"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6 }}
      >
        <p className="mono text-xs tracking-[0.25em] text-signal">{actNumber}</p>
        <h2
          id={`${id || actNumber}-heading`}
          className="display mt-4 text-4xl text-ink md:text-6xl"
        >
          {title.replace(/^ACT 0\d — /, "")}
        </h2>
      </motion.div>
    </section>
  );
}
