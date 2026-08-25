import { Suspense } from "react";
import RequestAccessClient from "./request-access-client";

export const dynamic = "force-dynamic";

export default function RequestAccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-ink-muted">Loading…</div>}>
      <RequestAccessClient />
    </Suspense>
  );
}
