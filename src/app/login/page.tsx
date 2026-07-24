import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-ink-muted">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
