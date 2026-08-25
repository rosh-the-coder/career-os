import Link from "next/link";
import { redirect } from "next/navigation";
import {
  finishOnboardingAction,
  saveApiKeyAction,
  deleteApiKeyAction,
  saveOnboardingBasicsAction,
  saveDirectionAction,
  setOnboardingStageAction,
} from "@/app/onboarding/actions";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { CareerProfilePreview } from "@/components/onboarding/career-profile-preview";
import { MarketSelector } from "@/components/onboarding/market-selector";
import { ResumeUploadForm } from "@/components/onboarding/resume-upload-form";
import { CareerMdImportForm } from "@/components/onboarding/career-md-import-form";
import { SubmitButton } from "@/components/onboarding/submit-button";
import { HelpTip } from "@/components/onboarding/help-tip";
import { Panel } from "@/components/ui";
import { getPrimaryUser } from "@/lib/auth/user";
import { listUserKeyMeta } from "@/lib/byok/keys";
import { KEY_CATALOG } from "@/lib/byok/catalog";
import { hasLlmConfigured } from "@/lib/onboarding/completeness";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{
    stage?: string;
    step?: string;
    error?: string;
    imported?: string;
    resume?: string;
    parsed?: string;
    e?: string;
    s?: string;
    p?: string;
  }>;
}) {
  const user = await getPrimaryUser();
  const sp = await searchParams;

  let stage = sp.stage || sp.step || user.onboardingStep || "welcome";
  if (stage === "resumes" || stage === "questions") stage = "evidence";
  if (stage === "keys") stage = "tools";
  if (stage === "done") redirect("/dashboard");
  if (user.onboardingStatus === "complete" && !sp.stage) redirect("/dashboard");

  const allowed = ["welcome", "basics", "evidence", "direction", "tools", "review"];
  if (!allowed.includes(stage)) stage = "welcome";

  const needKeys = stage === "tools";
  const needResumeBodies = stage === "evidence";

  const [expCount, projCount, skillCount, resumeCount, resumes, hasLlm, keys] = await Promise.all([
    prisma.experience.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.skill.count({ where: { userId: user.id } }),
    prisma.uploadedResume.count({ where: { userId: user.id } }),
    needResumeBodies
      ? prisma.uploadedResume.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, fileName: true, byteSize: true },
        })
      : Promise.resolve(
          [] as { id: string; fileName: string; byteSize: number }[],
        ),
    hasLlmConfigured(user.id, user.isOperator),
    needKeys ? listUserKeyMeta(user.id) : Promise.resolve([] as Awaited<ReturnType<typeof listUserKeyMeta>>),
  ]);

  const markets = parseJsonArray<string>(user.settings?.marketsJson ?? "[]");
  const completeness = user.completenessScore ?? 0;

  const preview = (
    <CareerProfilePreview
      name={user.name}
      markets={markets}
      roles={user.settings?.targetRolesText ?? ""}
      experienceCount={expCount}
      projectCount={projCount}
      skillCount={skillCount}
      resumeCount={resumeCount}
      completeness={completeness}
      hasLlm={hasLlm}
    />
  );

  const errorBanner =
    sp.error === "md_empty"
      ? "Add a .md file or paste the markdown before importing."
      : sp.error === "md_parse"
        ? "Couldn’t import that draft. Check the markdown and try again."
          : sp.error === "pdf"
            ? "Couldn’t read that PDF — try another file or paste the text."
            : sp.error === "pdf_empty"
              ? "That PDF had no extractable text (might be a scan). Paste the text instead."
              : sp.error === "resume_empty"
            ? "Add a .txt/.md file or paste resume text."
            : sp.error === "resume_limit"
              ? "Maximum 5 resumes for now."
              : sp.error === "name"
                ? "Add a name CareerOS can call you."
                : sp.error === "age"
                  ? "Age must be 18 or older."
                  : sp.error === "markets"
                    ? "Pick at least one search location."
                    : sp.error === "roles"
                      ? "Add at least one target role."
                      : null;

  return (
    <OnboardingShell stage={stage} completeness={completeness} preview={preview}>
      {errorBanner ? (
        <Panel className="mb-6 border-danger/40">
          <p className="text-sm text-danger">{errorBanner}</p>
        </Panel>
      ) : null}

      {sp.imported === "1" ? (
        <Panel className="mb-6 border-accent/30">
          <p className="text-sm text-ink">
            Draft imported. Review the pre-filled fields below — edit anything that looks off.
          </p>
        </Panel>
      ) : null}

      {stage === "welcome" ? (
        <div>
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            Let&apos;s teach CareerOS what you&apos;re working with.
          </h1>
          <p className="mt-3 text-ink-muted">
            About 10–15 minutes. Name yourself, import history, then confirm where and what you want
            to search.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-ink-muted">
            {[
              "Import resumes or a ChatGPT career .md",
              "Auto-fill targets, markets, and eligibility when present",
              "You edit anything before Discover unlocks",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-accent">✓</span> {t}
              </li>
            ))}
          </ul>
          <form action={setOnboardingStageAction} className="mt-10 flex flex-wrap gap-3">
            <input type="hidden" name="stage" value="basics" />
            <button type="submit" className="btn-primary">
              Build my CareerOS
            </button>
          </form>
        </div>
      ) : null}

      {stage === "basics" ? (
        <div>
          <h1 className="font-display text-3xl text-ink">Who is this for?</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Just identity for now. Markets, roles, and eligibility come after your history import —
            often pre-filled.
          </p>
          <form action={saveOnboardingBasicsAction} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-ink-muted">What should CareerOS call you?</span>
              <input
                name="name"
                required
                defaultValue={user.name !== "New user" ? user.name : ""}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Age (18+)</span>
              <input
                name="age"
                type="number"
                min={18}
                required
                defaultValue={user.age ?? ""}
                className="mt-1.5 w-full max-w-xs rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">Contact email on resumes</span>
              <input
                name="contactEmail"
                type="email"
                defaultValue={user.settings?.contactEmail || user.email}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <SubmitButton pendingLabel="Saving…">
              Continue — bring your history
            </SubmitButton>
          </form>
        </div>
      ) : null}

      {stage === "evidence" ? (
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Bring what you already have</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Add up to 5 resumes (PDF, .txt, .md) or paste text. CareerOS parses them into
              experience, skills, and projects — then continue to Direction to confirm.
            </p>
            {sp.parsed === "1" ? (
              <Panel className="mt-4 border-accent/30">
                <p className="text-sm text-ink">
                  Parsed into inventory
                  {sp.e || sp.s || sp.p
                    ? `: ${sp.e ?? "0"} experiences · ${sp.s ?? "0"} skills · ${sp.p ?? "0"} projects`
                    : "."}{" "}
                  Continue below to review and edit.
                </p>
              </Panel>
            ) : sp.resume === "1" ? (
              <p className="mt-2 text-sm text-accent">Resume saved.</p>
            ) : null}

            <div className="mt-4 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl text-ink">Resumes</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                {resumeCount}/5 uploaded
              </span>
            </div>

            {resumes.length > 0 ? (
              <ul className="mt-3 space-y-1.5 rounded-md border border-line bg-panel/40 p-3 text-xs font-mono text-ink-muted">
                {resumes.map((r) => (
                  <li key={r.id} className="flex justify-between gap-2">
                    <span className="truncate text-ink">{r.fileName}</span>
                    <span className="shrink-0 text-ink-faint">{r.byteSize} B</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-ink-faint">
                Drop or browse a resume below, then hit Parse resume(s).
              </p>
            )}

            {resumeCount < 5 ? (
              <ResumeUploadForm remainingSlots={5 - resumeCount} />
            ) : (
              <p className="mt-3 text-xs text-ink-muted">Resume limit reached (5).</p>
            )}
          </div>

          <Panel className="border-accent/20">
            <h2 className="font-display text-xl">Optional: structured career .md</h2>
            <CareerMdImportForm />
          </Panel>

          <div className="space-y-3 border-t border-line pt-6">
            {(() => {
              const canContinue =
                resumeCount > 0 ||
                expCount > 0 ||
                skillCount > 0 ||
                projCount > 0 ||
                sp.parsed === "1" ||
                sp.imported === "1";
              return (
                <>
                  <form action={setOnboardingStageAction}>
                    <input type="hidden" name="stage" value="direction" />
                    <button
                      type="submit"
                      disabled={!canContinue}
                      className="btn-primary"
                      title={
                        !canContinue
                          ? "Parse a resume or import a .md first"
                          : undefined
                      }
                    >
                      Continue to Direction →
                    </button>
                  </form>
                  {!canContinue ? (
                    <p className="text-xs text-ink-faint">
                      Parse at least one resume or import a career .md to continue.
                    </p>
                  ) : (
                    <p className="text-xs text-ink-muted">
                      Next you’ll confirm markets, roles, and eligibility — often pre-filled from
                      what you just imported.
                    </p>
                  )}
                  <form action={setOnboardingStageAction}>
                    <input type="hidden" name="stage" value="direction" />
                    <button
                      type="submit"
                      className="text-sm text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                    >
                      Skip for now — fill direction manually →
                    </button>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}

      {stage === "direction" ? (
        <div>
          <h1 className="font-display text-3xl text-ink">Where and what are you searching?</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Confirm or edit anything imported from your history. CareerOS uses this to filter roles —
            not as immigration advice.
          </p>
          <form action={saveDirectionAction} className="mt-6 space-y-6">
            <fieldset>
              <legend className="text-sm font-medium text-ink">Where are you actually searching?</legend>
              <p className="mt-1 text-xs text-ink-muted">
                Pick countries and cities/regions. Type to search (e.g. Delhi).
              </p>
              <div className="mt-3">
                <MarketSelector defaultSelected={markets} />
              </div>
            </fieldset>

            <label className="block text-sm">
              <span className="text-ink-muted">Home base (shown on CV header)</span>
              <input
                name="location"
                defaultValue={user.settings?.location === "Not set" ? "" : user.settings?.location}
                placeholder="e.g. Dublin, Ireland"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>

            <label className="block text-sm">
              <span className="text-ink-muted">What can you work under today?</span>
              <input
                name="currentPermission"
                defaultValue={
                  user.settings?.currentPermission === "Unknown"
                    ? ""
                    : user.settings?.currentPermission
                }
                placeholder="e.g. EU citizen, open work permit, Stamp 1G, needs sponsorship"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
              <p className="mt-1 text-xs text-ink-faint">
                Used to flag roles that may not be viable. Not legal advice.
              </p>
            </label>

            <label className="block text-sm">
              <span className="text-ink-muted">What do you want CareerOS to look for?</span>
              <input
                name="targetRolesText"
                required
                defaultValue={user.settings?.targetRolesText ?? ""}
                placeholder="UX Engineer, Product Designer"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">What should CareerOS avoid?</span>
              <textarea
                name="excludedRolesText"
                rows={2}
                defaultValue={user.settings?.excludedRolesText ?? ""}
                placeholder="Staff/Principal, CAD-heavy roles, unpaid internships…"
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-muted">How do you want employers to understand you?</span>
              <textarea
                name="candidatePositioning"
                rows={3}
                defaultValue={user.settings?.candidatePositioning ?? ""}
                className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
              />
            </label>
            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>
        </div>
      ) : null}

      {stage === "tools" ? (
        <div>
          <h1 className="font-display text-3xl text-ink">Connect tools CareerOS can use</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Public boards and deterministic scoring work without AI. At least one of Groq, Gemini, or
            OpenAI unlocks richer reasoning and résumé suggestions.
          </p>
          <div className="mt-6 space-y-3">
            {KEY_CATALOG.map((entry) => {
              const meta = keys.find((k) => k.provider === entry.provider);
              return (
                <div key={entry.provider} className="rounded-md border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{entry.label}</span>
                    <HelpTip
                      text={entry.tooltip}
                      href={entry.procureUrl}
                      hrefLabel={entry.procureLabel}
                    />
                    <span className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-muted">
                      {entry.badge}
                    </span>
                    {meta?.configured ? (
                      <span className="font-mono text-[10px] text-accent">••••{meta.lastFour}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted line-clamp-2">{entry.tooltip}</p>
                  <form action={saveApiKeyAction} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="provider" value={entry.provider} />
                    <input
                      name="value"
                      type="password"
                      autoComplete="off"
                      placeholder={meta?.configured ? "Paste to replace" : "Paste key"}
                      className="min-w-[12rem] flex-1 rounded-md border border-line bg-canvas px-3 py-1.5 text-sm"
                    />
                    <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm text-canvas transition-colors hover:bg-accent-dim">
                      {meta?.configured ? "Update" : "Save"}
                    </button>
                  </form>
                  {meta?.configured ? (
                    <form action={deleteApiKeyAction} className="mt-1">
                      <input type="hidden" name="provider" value={entry.provider} />
                      <button type="submit" className="text-xs text-danger hover:underline">
                        Delete key
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
          <form action={setOnboardingStageAction} className="mt-6">
            <input type="hidden" name="stage" value="review" />
            <button type="submit" className="btn-primary">
              Review setup
            </button>
          </form>
        </div>
      ) : null}

      {stage === "review" ? (
        <div>
          <h1 className="font-display text-3xl text-ink">Here&apos;s what CareerOS understands</h1>
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <div className="font-mono text-[10px] uppercase text-ink-faint">Targets</div>
              <p className="text-ink">{user.settings?.targetRolesText || "—"}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-ink-faint">Avoid</div>
              <p className="text-ink">{user.settings?.excludedRolesText || "—"}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-ink-faint">Search locations</div>
              <p className="text-ink">{markets.join(" · ") || "—"}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-ink-faint">Inventory</div>
              <p className="text-ink">
                {expCount} experiences · {projCount} projects · {skillCount} skills · {resumeCount}{" "}
                resumes
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-ink-faint">Tools</div>
              <p className="text-ink">{hasLlm ? "AI provider connected" : "No AI key yet"}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={finishOnboardingAction}>
              <button type="submit" className="btn-primary">
                Start my first search
              </button>
            </form>
            <Link
              href="/onboarding?stage=direction"
              className="rounded-md border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-panel-2"
            >
              Edit direction
            </Link>
          </div>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
