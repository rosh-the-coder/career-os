import { motion } from "framer-motion";
import { useReducedMotionFlag } from "@/lib/motion";

export function HeroScene({
  mode,
  title,
  subline,
  as: Tag = "h2",
  id,
}: {
  mode: "title" | "seal" | "ambient";
  title: string;
  subline?: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
}) {
  const reduced = useReducedMotionFlag();
  const size =
    mode === "title"
      ? "text-6xl md:text-8xl lg:text-9xl"
      : mode === "seal"
        ? "text-5xl md:text-7xl"
        : "text-3xl md:text-5xl";

  return (
    <section id={id} className="section-pin">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.8 }}
        >
          <Tag className={`display ${size} text-ink`}>{title}</Tag>
        </motion.div>
        {subline ? (
          <motion.p
            className="mt-8 text-lg text-muted md:text-xl"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.2, duration: 0.6 }}
          >
            {subline}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
