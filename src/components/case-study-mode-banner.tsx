import { isCaseStudyMode } from "@/lib/case-study/mode";

/** Internal banner — only when CAREEROS_CASE_STUDY_MODE=true. Not for production portfolio. */
export function CaseStudyModeBanner() {
  if (!isCaseStudyMode()) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center font-mono text-[11px] tracking-wide text-amber-100"
    >
      CASE STUDY DEMO DATA — safe contacts · isolated operator · do not use for real applications
    </div>
  );
}
