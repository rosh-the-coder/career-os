import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type MotionCtx = { reducedMotion: boolean };

const Ctx = createContext<MotionCtx>({ reducedMotion: false });

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <Ctx.Provider value={{ reducedMotion }}>{children}</Ctx.Provider>;
}

export function useReducedMotionFlag() {
  return useContext(Ctx).reducedMotion;
}
