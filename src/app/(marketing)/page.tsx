import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { HeroOperatingModel } from "@/components/marketing/hero-operating-model";
import { FragmentedWorkflow } from "@/components/marketing/fragmented-workflow";
import { OperatingModelWalkthrough } from "@/components/marketing/operating-model-walkthrough";
import { ProductProofComposition } from "@/components/marketing/product-proof-composition";
import { ScoreExplainer } from "@/components/marketing/score-explainer";
import { EvidenceResumePipeline } from "@/components/marketing/evidence-resume-pipeline";
import { ApplicationLifecycleDemo } from "@/components/marketing/application-lifecycle-demo";
import { CareerInventoryPreview } from "@/components/marketing/career-inventory-preview";
import { ByokProviderGrid } from "@/components/marketing/byok-provider-grid";
import { TrackOnce } from "@/components/analytics/track-once";

export const dynamic = "force-dynamic";

const PRINCIPLES = [
  { glyph: "◈", title: "Evidence before generation" },
  { glyph: "◎", title: "Human-controlled applications" },
  { glyph: "▦", title: "Explainable fit scoring" },
  { glyph: "⌘", title: "Your workspace + your keys" },
] as const;

export default function LandingPage() {
  return (
    <MarketingShell>
      <TrackOnce event="landing_view" />

      {/* 01 Hero — medium */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <span className="inline-flex rounded-md border border-line bg-panel-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              Invite-only beta
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[1.05] tracking-tight text-ink">
              Run your job search like a system.
            </h1>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-ink-muted md:text-lg">
              Discover better-fit roles, understand why they match, prepare evidence-grounded résumés,
              and keep every application under your control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/request-access"
                className="min-h-11 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent-dim"
              >
                Request access
              </Link>
              <Link
                href="/login"
                className="min-h-11 rounded-md border border-line px-5 py-2.5 text-sm text-ink hover:border-accent/40"
              >
                Sign in
              </Link>
            </div>
            <a
              href="#how-it-works"
              className="mt-6 inline-block text-sm text-ink-muted hover:text-ink"
            >
              See how CareerOS works ↓
            </a>
          </div>
          <HeroOperatingModel />
        </div>
      </section>

      {/* 02 Trust strip — compact */}
      <section
        className="border-y border-line"
        aria-label="Product principles"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 md:px-8 md:py-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex items-center gap-2 text-sm text-ink-muted">
              <span className="font-mono text-[11px] text-accent" aria-hidden>
                {p.glyph}
              </span>
              <span>{p.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 03 Problem — medium / visual */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24" id="how-it-works">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-ink">
          The handoffs were the problem.
        </h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          The problem wasn&apos;t finding another tool. It was the copy-paste chain between them.
        </p>
        <FragmentedWorkflow />
      </section>

      {/* 04 Operating model — long / sticky */}
      <section className="border-t border-line bg-panel/25 py-16 md:py-24" id="operating-model">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-ink">
            Four jobs. One operating model.
          </h2>
          <p className="mt-3 max-w-[48ch] text-ink-muted">
            Discover → Understand → Prepare → Track — stages of one job object, not four products.
          </p>
          <div className="mt-10 md:mt-14">
            <OperatingModelWalkthrough />
          </div>
        </div>
      </section>

      {/* 05 Product proof — medium visual beat */}
      <section className="overflow-hidden border-t border-line py-16 md:py-24" aria-label="Product proof">
        <ProductProofComposition />
      </section>

      {/* 06 Scoring — long / hero feature */}
      <section className="border-t border-line bg-panel/25 py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.08] tracking-tight text-ink">
            A score should explain itself.
          </h2>
          <p className="mt-4 max-w-[40ch] text-ink-muted">
            Rules first. Optional reasoning second. You decide third.
          </p>
          <div className="mt-12 md:mt-16">
            <ScoreExplainer />
          </div>
        </div>
      </section>

      {/* 07 Resume thesis — quiet / large */}
      <section className="flex min-h-[70vh] items-center justify-center px-4 py-24 md:min-h-[80vh] md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.08] tracking-tight text-ink">
            Generate résumés that sell you truthfully.
          </h2>
          <p className="mx-auto mt-6 max-w-[36ch] text-ink-muted">
            CareerOS can change the presentation. It cannot change the evidence.
          </p>
        </div>
      </section>

      {/* 08 Evidence pipeline — long */}
      <section className="border-t border-line bg-panel/25 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Evidence system
          </div>
          <div className="mt-8">
            <EvidenceResumePipeline />
          </div>
        </div>
      </section>

      {/* 09 Human control — quiet */}
      <section
        className="mx-auto max-w-3xl px-4 py-28 text-center md:px-8 md:py-36"
        id="principles"
      >
        <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.08] tracking-tight text-ink">
          CareerOS prepares. You decide.
        </h2>
        <ul className="mt-16 space-y-10 text-left text-base text-ink-muted md:text-lg">
          <li>
            CareerOS can recommend a role.
            <span className="mt-1.5 block text-ink">You decide whether it is worth applying.</span>
          </li>
          <li>
            CareerOS can prepare a résumé.
            <span className="mt-1.5 block text-ink">You approve the claims.</span>
          </li>
          <li>
            CareerOS can track the application.
            <span className="mt-1.5 block text-ink">You submit it.</span>
          </li>
        </ul>
        <p className="mt-16 text-sm text-ink-faint">
          CareerOS prepares applications. You remain responsible for submitting them.
        </p>
      </section>

      {/* 10 Tracking — medium */}
      <section className="border-t border-line bg-panel/25 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-ink">
            The search doesn&apos;t end at Apply.
          </h2>
          <p className="mt-3 max-w-[48ch] text-ink-muted">
            Keep every role, document and next action in one place.
          </p>
          <ApplicationLifecycleDemo />
        </div>
      </section>

      {/* 11 Inventory — medium */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <h2 className="mx-auto max-w-3xl text-center font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-ink">
          CareerOS gets useful by learning what you can prove.
        </h2>
        <p className="mx-auto mt-4 max-w-[48ch] text-center text-ink-muted">
          A stronger inventory improves filtering, scoring, and composition. Setup takes about
          10–15 minutes.
        </p>
        <CareerInventoryPreview />
      </section>

      {/* 12 BYOK — compact-medium */}
      <section className="border-t border-line py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-ink">
            Your workspace. Your keys.
          </h2>
          <p className="mt-3 max-w-[48ch] text-ink-muted">
            Isolated data per invite. AI uses providers you connect — never the operator&apos;s
            credentials.
          </p>
          <ByokProviderGrid />
        </div>
      </section>

      {/* 13 Beta CTA — quiet-large */}
      <section className="border-t border-line">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-28 text-center md:px-8 md:py-36">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.08] tracking-tight text-ink">
            Small beta.
            <br />
            Serious searchers.
          </h2>
          <p className="mx-auto mt-6 max-w-[40ch] text-ink-muted">
            CareerOS is currently available by invite while the multi-user experience is being
            refined.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/request-access"
              className="min-h-11 rounded-md bg-accent px-6 py-3 text-sm font-medium text-canvas hover:bg-accent-dim"
            >
              Request access
            </Link>
            <Link
              href="/login"
              className="min-h-11 rounded-md border border-line px-6 py-3 text-sm text-ink hover:border-accent/40"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
