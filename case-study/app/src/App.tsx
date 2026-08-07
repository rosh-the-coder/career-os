import { CaseStudyShell } from "@/components/CaseStudyShell";
import { HeroScene } from "@/components/HeroScene";
import { AntiPromiseScene } from "@/components/AntiPromiseScene";
import { ActDivider } from "@/components/ActDivider";
import { ToolPileScene } from "@/components/ToolPileScene";
import { WorkflowLoop } from "@/components/WorkflowLoop";
import { EcosystemOrbit } from "@/components/EcosystemOrbit";
import { PhilosophyStatement } from "@/components/PhilosophyStatement";
import { PrincipleGate } from "@/components/PrincipleGate";
import { ScoringExploder } from "@/components/ScoringExploder";
import { SystemArchitectureScene } from "@/components/SystemArchitectureScene";
import { HumanVsAIMap } from "@/components/HumanVsAIMap";
import { ProductScreenFigure } from "@/components/ProductScreenFigure";
import { AnnotatedScreenshot } from "@/components/AnnotatedScreenshot";
import { EvidencePipeline } from "@/components/EvidencePipeline";
import { ArchitectureDeepDive } from "@/components/ArchitectureDeepDive";
import { MetricCallout } from "@/components/MetricCallout";
import { HonestyPanel } from "@/components/HonestyPanel";
import { ReflectionSection } from "@/components/ReflectionSection";
import { NextProjectFooter } from "@/components/NextProjectFooter";
import { copy } from "@/lib/copy";
import ecosystem from "@diagrams/tool-ecosystem.json";
import loop from "@diagrams/daily-job-search-loop.json";

export default function App() {
  const orbitNodes = ecosystem.nodes as {
    id: string;
    label: string;
    category?: string;
    tooltip?: string;
  }[];
  const loopNodes = loop.nodes as { id: string; label: string }[];

  return (
    <CaseStudyShell>
      {/* Cold open */}
      <div id="cold-open">
        <HeroScene mode="title" title={copy.brand} subline={copy.subline} as="h1" />
        <AntiPromiseScene lines={[...copy.anti]} finalLine={copy.humanSubmits} />
      </div>

      {/* Act 1 */}
      <div id="act-1">
        <ActDivider actNumber="ACT 01" title={copy.act1} id="act-1-title" />
        <HeroScene mode="ambient" title="Timeline of rejection" subline="Abstract — not a measured count." />
        <ToolPileScene caption={copy.toolsCaption} />
        <HeroScene mode="seal" title={copy.misreads} />
        <HeroScene mode="ambient" title={copy.fitSkills} />
        <HeroScene mode="seal" title={copy.fragmented} subline={copy.fragmentedSub} />
        <p className="mx-auto max-w-2xl px-4 pb-24 text-center text-sm text-muted">{copy.origin}</p>
      </div>

      {/* Act 2 */}
      <div id="act-2">
        <ActDivider actNumber="ACT 02" title={copy.act2} />
        <p className="mx-auto max-w-xl px-4 text-center text-muted">{copy.decisionEngine}</p>
        <WorkflowLoop nodes={loopNodes} />
        <MetricCallout
          kind="conceptual20"
          title={copy.twenty}
          disclaimer={copy.twentyDisclaimer}
        />
        <HumanVsAIMap headline={copy.control} />
        <HeroScene mode="ambient" title={copy.whatExists} />
      </div>

      {/* Act 3 */}
      <div id="act-3">
        <ActDivider actNumber="ACT 03" title={copy.act3} />
        <EcosystemOrbit
          nodes={orbitNodes}
          sliceLine={copy.oneSlice}
          thesis={copy.nobodyOwns}
        />
      </div>

      {/* Act 4 */}
      <div id="act-4">
        <ActDivider actNumber="ACT 04" title={copy.act4} />
        <PhilosophyStatement text={copy.thesis} />
        <PrincipleGate title={copy.pEvidence} mode="evidence" />
        <PrincipleGate title={copy.pHuman} mode="human" />
        <ScoringExploder />
        <PrincipleGate title={copy.pTitle} mode="title" />
        <HeroScene mode="ambient" title={copy.beliefsEngine} />
      </div>

      {/* Act 5 */}
      <div id="act-5">
        <ActDivider actNumber="ACT 05" title={copy.act5} />
        <SystemArchitectureScene />
        <HumanVsAIMap headline={copy.aiAdvises} />
        <EvidencePipeline />
        <p className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-muted">{copy.engineNote}</p>
        <HeroScene mode="ambient" title={copy.thingItself} />
      </div>

      {/* Act 6 — real screens (placeholders until WebP capture) */}
      <div id="act-6">
        <ActDivider actNumber="ACT 06" title={copy.act6} />
        <ProductScreenFigure
          title="Dashboard"
          purpose={copy.pipelineGlance}
          takeaway="Built for daily use."
        >
          {/* source-proof: src/app/dashboard/page.tsx */}
          <AnnotatedScreenshot
            assetId="01-dashboard-overview"
            alt="CareerOS dashboard overview"
            annotations={["pipeline counts", "Discover CTA", "priority jobs"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Job discovery and import"
          purpose="Controlled ingestion — paste or URL."
          takeaway="Coverage with boundaries."
        >
          <AnnotatedScreenshot
            assetId="03-job-import"
            alt="Job import form"
            annotations={["paste", "URL"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Hard filters"
          purpose={copy.rolesEnd}
          takeaway="Filters are product, not bug."
        >
          {/* source-proof: src/lib/scoring/hard-filters.ts */}
          <AnnotatedScreenshot
            assetId="05-hard-reject"
            alt="Hard-rejected job detail"
            annotations={["reject banner", "reason"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Fit scoring"
          purpose={copy.explainable}
          takeaway="Multi-factor fit on the job itself."
        >
          {/* source-proof: src/lib/types.ts SCORE_WEIGHTS */}
          <AnnotatedScreenshot
            assetId="04-job-score-breakdown"
            alt="Job score breakdown"
            annotations={["total score", "dimension cards", "strengths and gaps"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Approve queue"
          purpose={copy.batchHuman}
          takeaway="Human triage before materials."
        >
          <AnnotatedScreenshot
            assetId="07-approve-queue"
            alt="Approve queue"
            annotations={["queue", "prepare packs"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Role and project recommendation"
          purpose="Positioning + project selection signals."
          takeaway="Right profile for the JD."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <AnnotatedScreenshot
              assetId="08-profile-recommendation"
              alt="Profile recommendation"
              annotations={["recommended profile"]}
            />
            <AnnotatedScreenshot
              assetId="09-project-recommendation"
              alt="Project recommendation"
              annotations={["project list"]}
            />
          </div>
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Resume Studio"
          purpose={copy.reviewBefore}
          takeaway="Claim-checked packs before the world sees them."
        >
          <AnnotatedScreenshot
            assetId="10-resume-studio-overview"
            alt="Resume Studio overview"
            annotations={["validation", "downloads", "composition"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Evidence and validation"
          purpose="Safeguards before export trust."
          takeaway="Corpus excludes the CV itself."
        >
          <AnnotatedScreenshot
            assetId="11-resume-validation"
            alt="Resume validation warnings"
            annotations={["warning badge", "warning list"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Resume versioning"
          purpose="Append-only lineage."
          takeaway="ATS apply creates a child — never silent overwrite."
        >
          <AnnotatedScreenshot
            assetId="13-resume-version-lineage"
            alt="Resume version lineage"
            annotations={["parent", "child"]}
          />
        </ProductScreenFigure>

        <ProductScreenFigure
          title="Applications tracker"
          purpose={copy.trackSent}
          takeaway="Submit stays outside the system."
        >
          <AnnotatedScreenshot
            assetId="15-applications-tracker"
            alt="Applications tracker"
            annotations={["status tags", "next actions"]}
          />
        </ProductScreenFigure>
      </div>

      {/* Act 7 */}
      <div id="act-7">
        <ActDivider actNumber="ACT 07" title={copy.act7} />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <ArchitectureDeepDive title="Hard filters" preview="Eligibility before opinion.">
            <p>
              Deterministic gates for geo, seniority, CAD/mechanical design-engineer signals, YOE
              thresholds, and related rules. Soft flags stay reviewable.
            </p>
            <p className="mt-3 mono text-xs text-faint">src/lib/scoring/hard-filters.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive title="LLM judge" preview="Narrative yes. Eligibility no.">
            <p>
              Optional Groq → Gemini judge merges with heuristics while locking eligibility floats.
            </p>
            <p className="mt-3 mono text-xs text-faint">src/lib/scoring/llm-judge.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive
            title="Claim validation"
            preview="Corpus excludes the CV itself."
          >
            <p>
              V3 validators ground claims in inventory evidence — not the generated document.
            </p>
            <p className="mt-3 mono text-xs text-faint">src/lib/resume/v3/validate-content.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive title="Official-title preservation" preview="No invented seniority.">
            <p>Title policy never invents official experience titles.</p>
            <p className="mt-3 mono text-xs text-faint">src/lib/resume/v3/title-policy.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive
            title="Resume composition"
            preview="Feature-flagged migration."
          >
            <p>
              Engines v2 templates → v3 inventory compose → v4 composition/themes behind{" "}
              <code>RESUME_ENGINE_VERSION</code>.
            </p>
            <p className="mt-3 mono text-xs text-faint">src/lib/resume/service.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive title="DOCX/PDF export" preview="Same pipeline. Two artifacts.">
            <p>Shared content model exported via docx + pdfkit.</p>
            <p className="mt-3 mono text-xs text-faint">src/lib/resume/export-docx.ts</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive title="Provider fallback" preview="Graceful degradation.">
            <p>Groq → Gemini → heuristic when keys or rate limits fail.</p>
            <p className="mt-3 mono text-xs text-faint">DECISION_LOG D3</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive title="Version lineage" preview="Append-only ResumeVersion rows.">
            <p>parentVersionId links ATS iterations without overwrite.</p>
            <p className="mt-3 mono text-xs text-faint">prisma/schema.prisma ResumeVersion</p>
          </ArchitectureDeepDive>
          <ArchitectureDeepDive
            title="Regression memory"
            preview="55 tests at audit · YOE negation locked."
          >
            <p>Vitest suite includes hard-filter negation and Arthur Cox fixture coverage.</p>
            <p className="mt-3 mono text-xs text-faint">tests/ · Historian §20</p>
          </ArchitectureDeepDive>
        </div>
        <p className="mx-auto max-w-2xl px-4 pb-8 text-center text-sm text-muted">{copy.trustNote}</p>
        <ReflectionSection headline={copy.stackForbids} />
      </div>

      {/* Act 8 */}
      <div id="act-8">
        <ActDivider actNumber="ACT 08" title={copy.act8} />
        <ReflectionSection headline={copy.authDull} />
        <ReflectionSection headline={copy.persist} />
        <ReflectionSection headline={copy.docsDrift} />
        <HonestyPanel mode="anti-metric" />
        <ReflectionSection headline={copy.tellTruth} />
      </div>

      {/* Close */}
      <div id="close">
        <HonestyPanel mode="scope" isLine={copy.is} isntLine={copy.isnt} />
        <MetricCallout kind="timeline" title={copy.commits} />
        <NextProjectFooter explore={copy.explore} credit={copy.credit} scope={copy.scope} />
      </div>
    </CaseStudyShell>
  );
}
