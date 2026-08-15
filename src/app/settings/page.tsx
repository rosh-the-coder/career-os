import { updateSettingsAction } from "@/app/actions";
import { PageHeader, Panel } from "@/components/ui";
import { getPrimaryUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getPrimaryUser();
  const s = user.settings;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Eligibility, salary preference, and targeting toggles. Stamp 1G valid to Sep 2027 (renewable to Sep 2028)."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Work permission</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Permission</dt>
              <dd>{s?.currentPermission}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Valid until</dt>
              <dd>{s?.permissionValidUntil}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Renewable until</dt>
              <dd>{s?.permissionRenewableUntil}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Employment status</dt>
              <dd>{s?.employmentStatus?.replace(/_/g, " ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Layoff date</dt>
              <dd>{s?.layoffDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Notice</dt>
              <dd>{s?.noticePeriod}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="font-display text-xl">Links</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="text-accent hover:underline" href={s?.portfolioUrl} target="_blank" rel="noreferrer">
                Portfolio
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href={s?.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href={s?.linkedinUrl} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="font-display text-xl">Preferences</h2>
          <form action={updateSettingsAction} className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="text-ink-muted">Daily Ireland batch target</span>
              <input
                name="dailyBatchTarget"
                type="number"
                defaultValue={s?.dailyBatchTarget ?? 25}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Salary floor (EUR, soft preference)</span>
              <input
                name="salaryFloorEur"
                type="number"
                defaultValue={s?.salaryFloorEur ?? 40000}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="salaryFloorSoft"
                type="checkbox"
                defaultChecked={s?.salaryFloorSoft ?? true}
                className="accent-accent"
              />
              Keep strong fits below salary floor for review
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="includeFallbackVideoRoles"
                type="checkbox"
                defaultChecked={s?.includeFallbackVideoRoles ?? false}
                className="accent-accent"
              />
              Include fallback video / motion roles
            </label>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
              Save preferences
            </button>
          </form>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="font-display text-xl">Discovery APIs</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Scoring uses an <span className="text-ink">LLM judge</span> (Groq free primary, Gemini
            fallback) after local hard filters. CV packs stay deterministic unless you turn Gemini polish
            on. Images should stay on Cloudflare Workers AI — don&apos;t share that neuron pool with
            CareerOS.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
            <li>
              Free Groq key:{" "}
              <a
                className="text-accent hover:underline"
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
              >
                console.groq.com/keys
              </a>{" "}
              → add <code className="text-ink">GROQ_API_KEY</code> to <code className="text-ink">.env</code>{" "}
              then restart. Optional:{" "}
              <code className="text-ink">GROQ_SCORE_MODEL=openai/gpt-oss-120b</code> for stronger
              judging (or <code className="text-ink">qwen/qwen3.6-27b</code>).
            </li>
            <li>
              Free Adzuna keys:{" "}
              <a
                className="text-accent hover:underline"
                href="https://developer.adzuna.com/"
                target="_blank"
                rel="noreferrer"
              >
                developer.adzuna.com
              </a>{" "}
              → <code className="text-ink">ADZUNA_APP_ID</code> +{" "}
              <code className="text-ink">ADZUNA_APP_KEY</code>.
            </li>
            <li>
              Optional board verify: <code className="text-ink">BRAVE_SEARCH_API_KEY</code> or{" "}
              <code className="text-ink">SERPAPI_KEY</code>.
            </li>
            <li>
              Niche employers: edit{" "}
              <code className="text-ink">src/lib/jobs/ireland-watchlist.ts</code>.
            </li>
          </ol>
        </Panel>
      </div>
    </div>
  );
}
