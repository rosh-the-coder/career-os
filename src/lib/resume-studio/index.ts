/**
 * Resume Studio V4 — public barrel.
 */

export * from "./composition/types";
export { composeDocument, compositionToMarkdown } from "./composition/compose-document";
export * from "./themes";
export {
  generateCompositionExports,
  exportCompositionDocx,
  exportCompositionPdf,
  runVisualHeuristics,
} from "./export";
export { runResumeCritic, heuristicCritique, type ResumeCritique } from "./critic/run-resume-critic";
export { composeResumeV3 } from "./selection";
export { loadCareerInventory, validateResumeContentV3 } from "./evidence";

export function resumeStudioVersion(): "v2" | "v3" | "v4" {
  const v = (process.env.RESUME_ENGINE_VERSION ?? "v4").toLowerCase();
  if (v === "v2") return "v2";
  if (v === "v3") return "v3";
  return "v4";
}
