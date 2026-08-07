import { useEffect, useState } from "react";
import { ACTS } from "@/lib/copy";

export function CaseStudyNavigation() {
  const [active, setActive] = useState("cold-open");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const ids = ACTS.map((a) => a.id);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.01 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }

    const onScroll = () => {
      const y = window.scrollY;
      const thesis = document.getElementById("philosophy-thesis");
      const inThesis =
        thesis &&
        thesis.getBoundingClientRect().top < window.innerHeight * 0.7 &&
        thesis.getBoundingClientRect().bottom > window.innerHeight * 0.3;
      setHidden(y < 80 || Boolean(inThesis));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Case study acts"
      className={`fixed top-0 right-0 left-0 z-40 border-b border-line/60 bg-canvas/80 backdrop-blur-md transition-opacity duration-300 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 md:justify-center md:gap-2">
        {ACTS.map((act) => (
          <a
            key={act.id}
            href={`#${act.id}`}
            className={`mono shrink-0 rounded-md px-2.5 py-1.5 text-[11px] tracking-wide transition ${
              active === act.id
                ? "bg-signal/20 text-signal"
                : "text-faint hover:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            }`}
          >
            {act.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
