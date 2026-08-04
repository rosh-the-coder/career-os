/**
 * Adapt ResumeContentV3 ↔ AtsResumeContent for exporters and legacy downloads.
 */

import type { AtsResumeContent, ResumeLinkUrls } from "@/lib/resume/export-docx";
import type { ResumeContentV3, SectionId } from "./types";

export function v3ToAtsContent(content: ResumeContentV3): AtsResumeContent {
  const linkUrls: ResumeLinkUrls = {};
  for (const l of content.header.links) {
    if (/linkedin/i.test(l.label)) linkUrls.linkedinUrl = l.url;
    else if (/portfolio/i.test(l.label)) linkUrls.portfolioUrl = l.url;
    else if (/github/i.test(l.label)) linkUrls.githubUrl = l.url;
  }

  const linksPipe = ["LinkedIn", "Portfolio", "GitHub"]
    .filter((label) => {
      if (label === "LinkedIn") return !!linkUrls.linkedinUrl;
      if (label === "Portfolio") return !!linkUrls.portfolioUrl;
      return !!linkUrls.githubUrl;
    })
    .join(" | ");

  return {
    documentTitle: content.header.name.toUpperCase(),
    professionalTitle: content.header.professionalTitle,
    contactLine: content.header.contactLine,
    linksLine: linksPipe,
    linkUrls,
    profile: content.summary.text,
    skills: content.skills.flatMap((g) => g.items.map((i) => i.name)),
    skillGroups: content.skills.map((g) => ({
      category: g.category ?? "Skills",
      items: g.items.map((i) => i.name).join(", "),
    })),
    sectionOrder: content.sectionOrder,
    projects: content.selectedProjects.map((p) => ({
      dates: p.dates,
      name: p.name,
      blurb: p.oneLineSummary ?? "",
      role: p.role ?? "",
      bullets: p.bullets.map((b) => b.text),
      technologies: p.technologies?.join(", "),
      // Real URLs only — never placeholders
      links: p.links?.length ? p.links.map((l) => `${l.label} (${l.url})`).join(" ") : undefined,
    })),
    experiences: content.experience.map((e) => ({
      dates: e.dates,
      title: e.title,
      company: e.company,
      location: e.location,
      companyBlurb: e.companyBlurb,
      functionalFocus: e.functionalFocus,
      bullets: e.bullets.map((b) => b.text),
    })),
    education: content.education.map((ed) => ({
      dates: ed.dates,
      line: ed.line,
      details: ed.details,
    })),
    technicalStack: (content.technicalStack ?? [])
      .filter((t) => t.items.length > 0)
      .map((t) => ({
        group: t.group,
        items: Array.isArray(t.items) ? t.items.join(", ") : String(t.items),
      })),
  };
}

function renderSectionMarkdown(content: ResumeContentV3, section: SectionId): string[] {
  const lines: string[] = [];
  switch (section) {
    case "summary":
      lines.push("PROFILE", content.summary.text, "");
      break;
    case "skills":
      lines.push("SKILLS");
      for (const g of content.skills) {
        if (g.category) lines.push(`${g.category}: ${g.items.map((i) => i.name).join(", ")}`);
        else lines.push(g.items.map((i) => i.name).join(" · "));
      }
      lines.push("");
      break;
    case "experience":
      lines.push("PROFESSIONAL EXPERIENCE");
      for (const e of content.experience) {
        lines.push(e.title);
        lines.push(`${e.company}${e.location ? ` | ${e.location}` : ""}`);
        lines.push(e.dates);
        if (e.companyBlurb) lines.push(e.companyBlurb);
        if (e.functionalFocus) lines.push(e.functionalFocus);
        for (const b of e.bullets) lines.push(`• ${b.text}`);
        lines.push("");
      }
      break;
    case "selectedProjects":
      lines.push("SELECTED PROJECTS");
      for (const p of content.selectedProjects) {
        lines.push(p.name);
        lines.push(p.dates);
        if (p.role) lines.push(`Role: ${p.role}`);
        if (p.oneLineSummary) lines.push(p.oneLineSummary);
        for (const b of p.bullets) lines.push(`• ${b.text}`);
        if (p.technologies?.length) lines.push(`Technologies: ${p.technologies.join(", ")}`);
        lines.push("");
      }
      break;
    case "education":
      lines.push("EDUCATION");
      for (const ed of content.education) {
        lines.push(`${ed.dates} ${ed.line}`.trim());
        for (const d of ed.details ?? []) lines.push(`• ${d}`);
      }
      lines.push("");
      break;
    case "technicalStack":
      if (content.technicalStack?.length) {
        lines.push("TECHNICAL STACK");
        for (const t of content.technicalStack) {
          if (t.items.length) lines.push(`${t.group}: ${t.items.join(", ")}`);
        }
        lines.push("");
      }
      break;
  }
  return lines;
}

export function v3ToMarkdown(content: ResumeContentV3): string {
  const lines: string[] = [
    content.header.name.toUpperCase(),
    content.header.professionalTitle,
    "",
    content.header.contactLine,
    content.header.links.map((l) => l.label.replace(/Github/i, "GitHub").replace(/Portfolio Website/i, "Portfolio")).join(" | "),
    "",
  ];

  for (const section of content.sectionOrder) {
    lines.push(...renderSectionMarkdown(content, section));
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export function isResumeContentV3(value: unknown): value is ResumeContentV3 {
  return (
    !!value &&
    typeof value === "object" &&
    (value as ResumeContentV3).schemaVersion === "3.0" &&
    Array.isArray((value as ResumeContentV3).selectedProjects)
  );
}
