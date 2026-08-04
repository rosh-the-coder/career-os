/**
 * Composition Engine — ResumeContentV3 + Theme → CompositionDocument.
 * Never selects content; only presents it.
 */

import type { ResumeContentV3 } from "@/lib/resume/v3/types";
import { getTheme, type Theme } from "../themes";
import type {
  CompositionBlock,
  CompositionDocument,
  ExperienceBlock,
  ProjectBlock,
  ThemeId,
} from "./types";
import { COMPOSER_VERSION_V4, RESUME_SCHEMA_V4 } from "./types";

const METRIC_RE =
  /\b(\d+(\.\d+)?K|\d+(\.\d+)?%|\d+\+|from\s+\d|→|->|\+\d+%|\d{2,}\s*\+?\s*(users|businesses|leads|episodes|videos|assets|products|mockups))/i;

function splitMetricsAndBullets(bullets: string[]): { metrics: string[]; body: string[] } {
  const metrics: string[] = [];
  const body: string[] = [];
  for (const b of bullets) {
    if (METRIC_RE.test(b) && b.length < 160) metrics.push(b);
    else body.push(b);
  }
  return { metrics, body };
}

function pushSection(
  blocks: CompositionBlock[],
  theme: Theme,
  label: string,
  sectionId: string,
) {
  if (theme.layout.sectionDivider === "rule") {
    blocks.push({ kind: "divider", style: "rule" });
  } else {
    blocks.push({ kind: "verticalSpacer", token: "sectionBefore" });
  }
  blocks.push({ kind: "sectionHeader", label, sectionId });
  if (theme.layout.sectionDivider === "rule") {
    blocks.push({ kind: "divider", style: "rule" });
  } else {
    blocks.push({ kind: "verticalSpacer", token: "sectionAfter" });
  }
}

function readingLinesFromBlocks(blocks: CompositionBlock[]): string[] {
  const lines: string[] = [];
  for (const b of blocks) {
    switch (b.kind) {
      case "header":
        lines.push(b.name.toUpperCase(), b.professionalTitle);
        break;
      case "contactRow":
        lines.push(b.text);
        break;
      case "linkRow":
        lines.push(b.links.map((l) => l.label).join(" | "));
        break;
      case "sectionHeader":
        lines.push(b.label);
        break;
      case "summaryParagraph":
        lines.push(b.text);
        break;
      case "skillGroup":
        lines.push(`${b.category}: ${b.items.join(", ")}`);
        break;
      case "experience":
        // ATS order: role → company → location → dates → summary → metrics → bullets
        lines.push(b.role);
        lines.push(b.company);
        if (b.location) lines.push(b.location);
        lines.push(b.dateLabel);
        if (b.summary) lines.push(b.summary);
        for (const m of b.metrics ?? []) lines.push(m);
        for (const x of b.bullets) lines.push(x);
        if (b.technologies?.length) lines.push(`Technologies: ${b.technologies.join(", ")}`);
        break;
      case "project":
        lines.push(b.name);
        lines.push(b.dateLabel);
        if (b.role) lines.push(`Role: ${b.role}`);
        if (b.summary) lines.push(b.summary);
        for (const m of b.metrics ?? []) lines.push(m);
        for (const x of b.bullets) lines.push(x);
        if (b.technologies?.length) lines.push(`Technologies: ${b.technologies.join(", ")}`);
        break;
      case "education":
        lines.push(`${b.dateLabel} ${b.line}`.trim());
        for (const d of b.details ?? []) lines.push(d);
        break;
      case "technicalStackGroup":
        lines.push(`${b.group}: ${b.items.join(", ")}`);
        break;
      case "metricHighlight":
        lines.push(b.text);
        break;
      case "technologyRow":
        lines.push(`${b.label}: ${b.items.join(", ")}`);
        break;
      case "bulletList":
        for (const i of b.items) lines.push(i);
        break;
      default:
        break;
    }
  }
  return lines.filter(Boolean);
}

export function composeDocument(
  content: ResumeContentV3,
  themeId: ThemeId | string = "arthur-cox",
): CompositionDocument {
  const theme = getTheme(themeId);
  const blocks: CompositionBlock[] = [];

  blocks.push({
    kind: "header",
    name: content.header.name,
    professionalTitle: content.header.professionalTitle,
  });
  blocks.push({ kind: "contactRow", text: content.header.contactLine });
  blocks.push({
    kind: "linkRow",
    links: content.header.links.map((l) => ({
      label: l.label.replace(/Github/i, "GitHub").replace(/Portfolio Website/i, "Portfolio"),
      url: l.url,
    })),
  });
  blocks.push({ kind: "verticalSpacer", token: "headerBottom" });

  for (const section of content.sectionOrder) {
    switch (section) {
      case "summary":
        pushSection(blocks, theme, "PROFILE", "summary");
        blocks.push({ kind: "summaryParagraph", text: content.summary.text });
        break;
      case "skills":
        pushSection(blocks, theme, "SKILLS", "skills");
        for (const g of content.skills) {
          if (!g.items.length) continue;
          blocks.push({
            kind: "skillGroup",
            category: g.category ?? "Skills",
            items: g.items.map((i) => i.name),
          });
        }
        break;
      case "experience":
        pushSection(blocks, theme, "PROFESSIONAL EXPERIENCE", "experience");
        for (const e of content.experience) {
          const texts = e.bullets.map((b) => b.text);
          const { metrics, body } = splitMetricsAndBullets(texts);
          const block: ExperienceBlock = {
            kind: "experience",
            dateLabel: e.dates,
            role: e.title,
            company: e.company,
            location: e.location,
            summary: e.companyBlurb,
            metrics: metrics.length ? metrics : undefined,
            bullets: body.length ? body : texts.filter((t) => !metrics.includes(t)),
            experienceId: e.experienceId,
          };
          // If all bullets classified as metrics, keep them as bullets too for density
          if (!block.bullets.length && metrics.length) {
            block.bullets = metrics;
            block.metrics = metrics.slice(0, 3);
          }
          blocks.push({ kind: "pageBreakHint", keepWithNext: true });
          blocks.push(block);
          blocks.push({ kind: "verticalSpacer", token: "entryGap" });
        }
        break;
      case "selectedProjects":
        pushSection(blocks, theme, "SELECTED PROJECTS", "selectedProjects");
        for (const p of content.selectedProjects) {
          const texts = p.bullets.map((b) => b.text);
          const { metrics, body } = splitMetricsAndBullets(texts);
          const block: ProjectBlock = {
            kind: "project",
            dateLabel: p.dates,
            name: p.name,
            role: p.role,
            summary: p.oneLineSummary,
            metrics: metrics.length ? metrics : undefined,
            bullets: body.length ? body : texts,
            technologies: p.technologies,
            links: p.links,
            projectKey: p.projectKey,
          };
          blocks.push({ kind: "pageBreakHint", keepWithNext: true });
          blocks.push(block);
          blocks.push({ kind: "verticalSpacer", token: "entryGap" });
        }
        break;
      case "education":
        pushSection(blocks, theme, "EDUCATION", "education");
        for (const ed of content.education) {
          blocks.push({
            kind: "education",
            dateLabel: ed.dates,
            line: ed.line,
            details: ed.details,
          });
        }
        break;
      case "technicalStack": {
        const groups = (content.technicalStack ?? []).filter((g) => g.items.length);
        if (!groups.length) break;
        pushSection(blocks, theme, "TECHNICAL STACK", "technicalStack");
        for (const g of groups) {
          blocks.push({ kind: "technicalStackGroup", group: g.group, items: g.items });
        }
        break;
      }
    }
  }

  return {
    schemaVersion: RESUME_SCHEMA_V4,
    themeId: theme.id,
    pageLength: content.generationMetadata.pageLength,
    blocks,
    readingOrder: readingLinesFromBlocks(blocks),
    meta: {
      jobId: content.target.jobId,
      profileKey: content.target.profileKey,
      company: content.target.company,
      jobTitle: content.target.title,
      generatedAt: new Date().toISOString(),
      composerVersion: COMPOSER_VERSION_V4,
    },
  };
}

export function compositionToMarkdown(doc: CompositionDocument): string {
  return doc.readingOrder.join("\n") + "\n";
}
