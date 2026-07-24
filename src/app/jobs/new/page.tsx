"use client";

import { useActionState } from "react";
import { importJobAction, type ActionState } from "@/app/actions";
import { PageHeader, Panel } from "@/components/ui";

const initial: ActionState = {};

export default function ImportJobPage() {
  const [state, formAction, pending] = useActionState(importJobAction, initial);

  return (
    <div>
      <PageHeader
        title="Import job"
        description="Paste a description, a URL, or both. Indeed/LinkedIn/Glassdoor need the description pasted — keep the URL for tracking."
      />

      <Panel className="mb-4 border-info/30">
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-info">URL tip:</span> Greenhouse, Lever, Ashby, and many
          company career pages auto-fetch. Indeed / LinkedIn / Glassdoor return 403 if fetched alone —
          paste the JD text + URL and CareerOS will score and track it (Model A: you still submit).
        </p>
      </Panel>

      {state.error ? (
        <Panel className="mb-4 border-danger/40">
          <p className="text-sm text-danger">{state.error}</p>
        </Panel>
      ) : null}

      <Panel>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-ink-muted">Title (optional)</span>
              <input
                name="title"
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-ink outline-none focus:border-accent/50"
                placeholder="UX Engineer"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-ink-muted">Company (optional)</span>
              <input
                name="company"
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-ink outline-none focus:border-accent/50"
                placeholder="Acme"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-ink-muted">Job URL</span>
            <input
              name="url"
              type="url"
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-ink outline-none focus:border-accent/50"
              placeholder="https://ie.indeed.com/... or https://boards.greenhouse.io/..."
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-ink-muted">Listing category</span>
            <select
              name="listingCategory"
              defaultValue="auto"
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-ink outline-none focus:border-accent/50"
            >
              <option value="auto">Auto-detect</option>
              <option value="ireland_core">Ireland / Dublin core (daily 25)</option>
              <option value="eu_sponsorship">EU + visa sponsorship (exclusive track)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-ink-muted">Job description</span>
            <textarea
              name="description"
              rows={16}
              required
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent/50"
              placeholder="Paste the full job description here (required for Indeed/LinkedIn)…"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-60"
          >
            {pending ? "Importing…" : "Import & score"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
