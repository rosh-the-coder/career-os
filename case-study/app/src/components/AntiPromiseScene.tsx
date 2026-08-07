import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotionFlag } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function AntiPromiseScene({
  lines,
  finalLine,
}: {
  lines: string[];
  finalLine: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionFlag();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      const strikes = gsap.utils.toArray<HTMLElement>(".strike-line");
      gsap.set(strikes, { "--strike": 0 } as gsap.TweenVars);
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=120%",
            scrub: true,
            pin: true,
          },
        })
        .to(strikes, {
          stagger: 0.35,
          duration: 0.5,
          onUpdate: function () {
            // handled via CSS var animation below
          },
        })
        .fromTo(
          strikes,
          { backgroundSize: "0% 2px" },
          { backgroundSize: "100% 2px", stagger: 0.4, ease: "none" },
          0,
        )
        .fromTo(".final-line", { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, "-=0.1");
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} className="section-pin" aria-label="Anti-promises">
      <div className="mx-auto max-w-3xl space-y-8 px-4">
        <ul className="space-y-6">
          {lines.map((line) => (
            <li
              key={line}
              className="strike-line display text-2xl text-muted md:text-4xl"
              style={{
                backgroundImage: "linear-gradient(currentColor, currentColor)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left center",
                backgroundSize: reduced ? "100% 2px" : "0% 2px",
              }}
            >
              {line}
            </li>
          ))}
        </ul>
        <p
          className={`final-line display text-3xl text-signal md:text-5xl ${reduced ? "opacity-100" : "opacity-0"}`}
        >
          {finalLine}
        </p>
      </div>
    </section>
  );
}
