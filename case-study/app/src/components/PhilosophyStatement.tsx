import { motion } from "framer-motion";
import { useReducedMotionFlag } from "@/lib/motion";

export function PhilosophyStatement({ text, id }: { text: string; id?: string }) {
  const reduced = useReducedMotionFlag();
  const words = text.split(" ");

  return (
    <section
      id={id || "philosophy-thesis"}
      className="flex min-h-[140vh] items-center justify-center px-6"
      aria-label="Thesis"
    >
      <h2 className="display max-w-5xl text-center text-4xl leading-[1.1] text-ink md:text-6xl lg:text-7xl">
        {reduced
          ? text
          : words.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                className="mr-[0.28em] inline-block"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                {w}
              </motion.span>
            ))}
      </h2>
    </section>
  );
}
