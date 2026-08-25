/**
 * Lightweight analytics hooks. No third-party SDK required.
 * Swap `emit` to wire PostHog/Segment/etc. later.
 */

export type AnalyticsEvent =
  | "landing_view"
  | "hero_request_access"
  | "hero_sign_in"
  | "how_it_works_view"
  | "request_access_submit"
  | "login_started"
  | "login_success"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "resume_imported"
  | "provider_connected"
  | "onboarding_completed"
  | "first_discovery_started"
  | "first_job_reviewed"
  | "first_resume_generated";

type Payload = Record<string, string | number | boolean | null | undefined>;

function emit(event: AnalyticsEvent, payload?: Payload) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, payload ?? {});
  }
  // Intentionally no PII / resume content / API keys in payloads.
}

export function track(event: AnalyticsEvent, payload?: Payload) {
  try {
    emit(event, payload);
  } catch {
    /* never break product flows for analytics */
  }
}
