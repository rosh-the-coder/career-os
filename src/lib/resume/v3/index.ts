export * from "./types";
export * from "./role-policy";
export * from "./load-career-profile";
export * from "./rank-projects";
export * from "./rank-experience";
export * from "./compose-summary";
export * from "./compose-projects";
export * from "./compose-experience";
export * from "./compose-resume";
export * from "./validate-content";
export * from "./adapter";
export * from "./export-validation";
export * from "./date-format";

export function resumeEngineVersion(): "v2" | "v3" | "v4" {
  const v = (process.env.RESUME_ENGINE_VERSION ?? "v4").toLowerCase();
  if (v === "v2") return "v2";
  if (v === "v3") return "v3";
  return "v4";
}
