import type { ChecklistState } from "@/components/onboarding/first-run-checklist";

export function parseSetupChecklist(raw: string | null | undefined): ChecklistState {
  try {
    const parsed = JSON.parse(raw || "{}") as Partial<ChecklistState>;
    return {
      profile: Boolean(parsed.profile),
      markets: Boolean(parsed.markets),
      eligibility: Boolean(parsed.eligibility),
      ai: Boolean(parsed.ai),
      firstJob: Boolean(parsed.firstJob),
      firstResume: Boolean(parsed.firstResume),
      firstApp: Boolean(parsed.firstApp),
      dismissed: Boolean(parsed.dismissed),
    };
  } catch {
    return {
      profile: false,
      markets: false,
      eligibility: false,
      ai: false,
      firstJob: false,
      firstResume: false,
      firstApp: false,
      dismissed: false,
    };
  }
}

export function mergeChecklist(
  current: ChecklistState,
  patch: Partial<ChecklistState>,
): ChecklistState {
  return { ...current, ...patch };
}

export function checklistComplete(state: ChecklistState): boolean {
  return (
    state.profile &&
    state.markets &&
    state.eligibility &&
    state.ai &&
    state.firstJob &&
    state.firstResume &&
    state.firstApp
  );
}
