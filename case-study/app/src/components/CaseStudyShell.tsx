import { type ReactNode } from "react";
import { MotionProvider } from "@/lib/motion";
import { CaseStudyNavigation } from "@/components/CaseStudyNavigation";

export function CaseStudyShell({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CaseStudyNavigation />
      <main id="main">{children}</main>
    </MotionProvider>
  );
}
