"use client";

import { useActionState } from "react";
import { importJobAction, type ActionState } from "@/app/actions";
import { JdTextareaField } from "@/components/jd-word-meter";
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
          <span className="font-medium text-info">Glassdoor / LinkedIn / Indeed:</span> we never scrape
          those sites (antibot + account bans). Instead CareerOS finds roles from company boards + job
          aggregators, then can <em>verify</em> they also appear on LinkedIn/Indeed/Glassdoor via a
          search API (Brave/SerpAPI) — index check only. Deloitte-style listings: open the post → copy
          JD → paste here with the URL. Gmail job alerts (later) are the cleanest LinkedIn path.
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
            <JdTextareaField name="description" required rows={16} />
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
