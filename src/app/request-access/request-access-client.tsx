"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitAccessRequestAction, type AccessRequestState } from "@/app/request-access/actions";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Panel } from "@/components/ui";

const initial: AccessRequestState = {};

export default function RequestAccessClient() {
  const [state, action, pending] = useActionState(submitAccessRequestAction, initial);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-lg px-4 py-16 md:px-8">
        <h1 className="font-display text-4xl text-ink">Request access</h1>
        <p className="mt-3 text-ink-muted">
          CareerOS is invite-only. Tell us a little about your search — we review requests manually.
          No account is created until you&apos;re invited.
        </p>

        {state.ok ? (
          <Panel className="mt-8 border-accent/30">
            <p className="text-sm text-ink">
              {state.duplicate
                ? "You’re already on the list for this email. We’ll be in touch."
                : "Request received. If there’s a fit for the beta, you’ll get an invite by email."}
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
              ← Back to CareerOS
            </Link>
          </Panel>
        ) : (
          <form action={action} className="mt-8 space-y-4">
            <label className="block text-sm">
              <span className="text-ink-muted">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">First name</span>
              <input
                name="firstName"
                required
                autoComplete="given-name"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">What are you searching for?</span>
              <input
                name="searchingFor"
                placeholder="e.g. UX Engineer roles in Ireland / EU"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Optional note</span>
              <textarea
                name="note"
                rows={3}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-canvas disabled:opacity-60"
            >
              {pending ? "Sending…" : "Submit request"}
            </button>
            <p className="text-center text-sm text-ink-muted">
              Already invited?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </MarketingShell>
  );
}
