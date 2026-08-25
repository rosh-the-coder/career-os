import {
  createInviteAction,
  deleteApiKeyAction,
  dismissAccessRequestAction,
  inviteAccessRequestAction,
  saveApiKeyAction,
} from "@/app/onboarding/actions";
import { updateSettingsAction } from "@/app/actions";
import { PageHeader, Panel } from "@/components/ui";
import { listPendingAccessRequests } from "@/lib/auth/access-requests";
import { listInvites } from "@/lib/auth/invites";
import { KEY_CATALOG } from "@/lib/byok/catalog";
import { listUserKeyMeta } from "@/lib/byok/keys";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

function KeyTooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-help align-middle text-ink-faint">
      <span className="rounded border border-line px-1 font-mono text-[10px]">?</span>
      <span className="pointer-events-none absolute left-0 top-6 z-20 hidden w-72 rounded-md border border-line bg-canvas p-3 text-xs leading-relaxed text-ink shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

export default async function SettingsPage() {
  const { requireOnboarded } = await import("@/lib/auth/onboarding-gate");
  const user = await requireOnboarded();
  const s = user.settings;
  const keys = await listUserKeyMeta(user.id);
  const markets = parseJsonArray<string>(s?.marketsJson ?? "[]");
  const invites = user.isOperator ? await listInvites(user.id) : [];
  const accessRequests = user.isOperator ? await listPendingAccessRequests() : [];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Eligibility, markets, targeting, and your own API keys. Guests never inherit the operator’s env keys."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Profile</h2>
          <form action={updateSettingsAction} className="mt-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-ink-muted">Name</span>
              <input
                name="name"
                defaultValue={user.name}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Location</span>
              <input
                name="location"
                defaultValue={s?.location ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Work permission</span>
              <input
                name="currentPermission"
                defaultValue={s?.currentPermission ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Permission valid until</span>
              <input
                name="permissionValidUntil"
                defaultValue={s?.permissionValidUntil ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Renewable until</span>
              <input
                name="permissionRenewableUntil"
                defaultValue={s?.permissionRenewableUntil ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Contact email</span>
              <input
                name="contactEmail"
                defaultValue={s?.contactEmail ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">Phone</span>
              <input
                name="phone"
                defaultValue={s?.phone ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
              Save profile
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-display text-xl">Links</h2>
          <form action={updateSettingsAction} className="mt-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-ink-muted">Portfolio</span>
              <input
                name="portfolioUrl"
                defaultValue={s?.portfolioUrl ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">GitHub</span>
              <input
                name="githubUrl"
                defaultValue={s?.githubUrl ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-ink-muted">LinkedIn</span>
              <input
                name="linkedinUrl"
                defaultValue={s?.linkedinUrl ?? ""}
                className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
              Save links
            </button>
          </form>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="font-display text-xl">Discovery preferences</h2>
          <form action={updateSettingsAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-ink-muted">Markets (comma-separated)</span>
              <input
                name="markets"
                defaultValue={markets.join(", ")}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Primary market label</span>
              <input
                name="primaryMarketLabel"
                defaultValue={s?.primaryMarketLabel ?? ""}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-ink-muted">Target role titles</span>
              <input
                name="targetRolesText"
                defaultValue={s?.targetRolesText ?? ""}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-ink-muted">Roles to avoid (comma-separated)</span>
              <input
                name="excludedRolesText"
                defaultValue={s?.excludedRolesText ?? ""}
                placeholder="e.g. Mechanical Design Engineer, unpaid internship"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-ink-muted">Positioning for AI judge</span>
              <textarea
                name="candidatePositioning"
                rows={2}
                defaultValue={s?.candidatePositioning ?? ""}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Daily batch target</span>
              <input
                name="dailyBatchTarget"
                type="number"
                defaultValue={s?.dailyBatchTarget ?? 25}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Max Discovers / day</span>
              <input
                name="maxDiscoversPerDay"
                type="number"
                defaultValue={s?.maxDiscoversPerDay ?? 3}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Salary floor (EUR, soft)</span>
              <input
                name="salaryFloorEur"
                type="number"
                defaultValue={s?.salaryFloorEur ?? 40000}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm self-end">
              <input
                name="salaryFloorSoft"
                type="checkbox"
                defaultChecked={s?.salaryFloorSoft ?? true}
                className="accent-accent"
              />
              Keep strong fits below salary floor
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
            <div className="md:col-span-2">
              <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
                Save preferences
              </button>
            </div>
          </form>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="font-display text-xl">API keys (yours)</h2>
          <p className="mt-2 text-sm text-ink-muted">
            At least one of Groq / Gemini / OpenAI for full AI. Adzuna recommended for richer Discover.
            Hover the ? for how each key works and where to get it.
          </p>
          <div className="mt-4 space-y-3">
            {KEY_CATALOG.map((entry) => {
              const meta = keys.find((k) => k.provider === entry.provider);
              return (
                <div key={entry.provider} className="rounded-md border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{entry.label}</span>
                    <span className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-muted">
                      {entry.badge}
                    </span>
                    <KeyTooltip text={entry.tooltip} />
                    {meta?.configured ? (
                      <span className="font-mono text-[10px] text-accent">••••{meta.lastFour}</span>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-faint">not set</span>
                    )}
                  </div>
                  {entry.procureUrl ? (
                    <a
                      href={entry.procureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-accent hover:underline"
                    >
                      {entry.procureLabel}
                    </a>
                  ) : null}
                  <form action={saveApiKeyAction} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="provider" value={entry.provider} />
                    <input
                      name="value"
                      type="password"
                      autoComplete="off"
                      placeholder={meta?.configured ? "Paste to replace" : "Paste key"}
                      className="min-w-[14rem] flex-1 rounded-md border border-line bg-canvas px-3 py-1.5 text-sm"
                    />
                    <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm text-canvas">
                      {meta?.configured ? "Update" : "Save"}
                    </button>
                  </form>
                  {meta?.configured ? (
                    <form action={deleteApiKeyAction} className="mt-1">
                      <input type="hidden" name="provider" value={entry.provider} />
                      <button type="submit" className="text-xs text-danger hover:underline">
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
          {user.isOperator ? (
            <p className="mt-3 text-xs text-ink-muted">
              Operator note: if you don’t paste BYOK rows, CareerOS still uses your server{" "}
              <code className="text-ink">.env</code> keys for your account only.
            </p>
          ) : null}
        </Panel>

        {user.isOperator ? (
          <Panel className="lg:col-span-2">
            <h2 className="font-display text-xl">Access requests</h2>
            <p className="mt-1 text-sm text-ink-muted">
              People who asked for beta access. Invite sends them an email with the login link — no Supabase
              dashboard needed.
            </p>
            {accessRequests.length === 0 ? (
              <p className="mt-4 text-sm text-ink-faint">No pending requests.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {accessRequests.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-line bg-canvas/40 p-3"
                  >
                    <div className="min-w-0 text-sm">
                      <div className="font-medium text-ink">
                        {req.firstName} · {req.email}
                      </div>
                      {req.searchingFor ? (
                        <div className="mt-1 text-ink-muted">Looking for: {req.searchingFor}</div>
                      ) : null}
                      {req.note ? <div className="mt-1 text-xs text-ink-faint">{req.note}</div> : null}
                      <div className="mt-1 font-mono text-[10px] text-ink-faint">
                        {new Date(req.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <form action={inviteAccessRequestAction}>
                        <input type="hidden" name="accessRequestId" value={req.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-canvas"
                        >
                          Invite
                        </button>
                      </form>
                      <form action={dismissAccessRequestAction}>
                        <input type="hidden" name="accessRequestId" value={req.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-muted"
                        >
                          Dismiss
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ) : null}

        {user.isOperator ? (
          <Panel className="lg:col-span-2">
            <h2 className="font-display text-xl">Invite beta users</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Or paste an email directly. They sign in at /login — CareerOS emails them when you invite.
            </p>
            <form action={createInviteAction} className="mt-4 flex flex-wrap gap-2">
              <input
                name="email"
                type="email"
                required
                placeholder="friend@email.com"
                className="min-w-[16rem] flex-1 rounded-md border border-line bg-canvas px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas">
                Create invite
              </button>
            </form>
            <ul className="mt-4 space-y-1 text-xs font-mono text-ink-muted">
              {invites.map((inv) => (
                <li key={inv.id}>
                  {inv.email} · expires {inv.expiresAt.toISOString().slice(0, 10)}
                  {inv.usedAt ? " · used" : " · pending"}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
