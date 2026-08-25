"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

/** Fires once on mount — for landing / key funnel views. */
export function TrackOnce({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
