/**
 * Heuristic plain-text / markdown resume parser for onboarding ingest.
 * Extracts structure only — never invents employers, metrics, or skills.
 */

import {
  parseCareerHistoryMarkdown,
  type ParsedCareerHistory,
} from "@/lib/onboarding/parse-history-md";

export type ParsedResume = ParsedCareerHistory & {
  contactEmail?: string;
  location?: string;
  headline?: string;
};

const SECTION_RE =
  /^(experience|work history|employment|professional experience|skills|technical skills|core skills|projects|selected projects|portfolio|education|summary|profile|about|objective|certifications?)\s*:?\s*$/i;

function extractHeaderMeta(text: string): Pick<ParsedResume, "contactEmail" | "location" | "headline"> {
  const head = text.split("\n").slice(0, 12).join("\n");
  const emailMatch = head.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const locationMatch = head.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?,\s*(?:Ireland|UK|United Kingdom|USA|United States|Canada|India|Germany|Spain|France|Portugal|Netherlands|Australia|Remote))\b/,
  );
  const lines = head
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/@/.test(l) && !/^\+?\d/.test(l));
  // Skip name-like first line; take a short title-ish line
  const headline = lines.find(
    (l, i) =>
      i > 0 &&
      l.length > 4 &&
      l.length < 80 &&
      !SECTION_RE.test(l) &&
      !/,/.test(l) &&
      /(designer|engineer|developer|product|ux|ui|research|manager|analyst|founder)/i.test(l),
  );

  return {
    contactEmail: emailMatch?.[0],
    location: locationMatch?.[1],
    headline,
  };
}

function bulletsFrom(lines: string[]): string[] {
  return lines
    .filter((l) => /^[-*•]/.test(l) || /^\d+\./.test(l))
    .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter((l) => l.length > 2);
}

function isJobHeader(line: string): boolean {
  if (SECTION_RE.test(line)) return false;
  if (line.length > 120) return false;
  const hasSep = /[|—–\-@]/.test(line) || /\s[–—]\s/.test(line);
  const hasYear = /\b(19|20)\d{2}\b/.test(line) || /\bpresent\b/i.test(line);
  const hasTitleWord =
    /(designer|engineer|developer|product|manager|analyst|lead|intern|consultant|founder|director|specialist|researcher)/i.test(
      line,
    );
  return (hasSep && (hasYear || hasTitleWord)) || (hasYear && hasTitleWord);
}

function parseJobHeader(line: string): { title: string; company: string } {
  const cleaned = line.replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s*[|—–]\s*|\s+[-–—]\s+|\s+@\s+/).map((p) => p.trim());
  if (parts.length >= 2) {
    // Prefer title first when it looks like a role
    const a = parts[0]!;
    const b = parts[1]!;
    if (/\b(19|20)\d{2}\b|present/i.test(b) && parts[2]) {
      return { title: a, company: parts[2]! };
    }
    if (/\b(19|20)\d{2}\b|present/i.test(a)) {
      return { title: b, company: parts[2] || a };
    }
    return { title: a, company: b };
  }
  return { title: cleaned, company: cleaned };
}

function splitSections(text: string): { name: string; body: string[] }[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim());
  const sections: { name: string; body: string[] }[] = [];
  let current = { name: "header", body: [] as string[] };
  for (const line of lines) {
    if (!line) continue;
    if (SECTION_RE.test(line)) {
      sections.push(current);
      current = { name: line.replace(/:$/, "").trim().toLowerCase(), body: [] };
      continue;
    }
    current.body.push(line);
  }
  sections.push(current);
  return sections.filter((s) => s.body.length > 0 || s.name !== "header");
}

function parsePlainResume(text: string): ParsedCareerHistory {
  const sections = splitSections(text);
  const experiences: ParsedCareerHistory["experiences"] = [];
  const projects: ParsedCareerHistory["projects"] = [];
  const skills: string[] = [];
  const notes: string[] = [];

  for (const section of sections) {
    const name = section.name;
    if (/skill/.test(name)) {
      const joined = section.body.join(" ");
      const parts = joined
        .split(/[,|•·]/)
        .map((s) => s.replace(/^[-*]\s*/, "").trim())
        .filter((s) => s.length > 1 && s.length < 48 && !SECTION_RE.test(s));
      skills.push(...parts);
      const bulletSkills = bulletsFrom(section.body);
      skills.push(...bulletSkills);
      continue;
    }

    if (/project|portfolio/.test(name)) {
      let current: { name: string; bullets: string[] } | null = null;
      for (const line of section.body) {
        if (isJobHeader(line) || (!/^[-*•]/.test(line) && line.length < 80 && !/\.$/.test(line))) {
          if (current) projects.push(current);
          current = { name: line.slice(0, 120), bullets: [] };
        } else if (current && (/^[-*•]/.test(line) || line.length > 20)) {
          current.bullets.push(line.replace(/^[-*•]\s*/, "").trim());
        } else if (!current) {
          current = { name: line.slice(0, 120), bullets: [] };
        }
      }
      if (current) projects.push(current);
      continue;
    }

    if (/experience|work|employment/.test(name)) {
      let current: ParsedCareerHistory["experiences"][number] | null = null;
      for (const line of section.body) {
        if (isJobHeader(line)) {
          if (current) experiences.push(current);
          const { title, company } = parseJobHeader(line);
          current = { title, company, bullets: [], raw: line };
        } else if (current) {
          if (/^[-*•]/.test(line) || /^\d+\./.test(line) || line.length > 40) {
            current.bullets.push(line.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "").trim());
          }
        }
      }
      if (current) experiences.push(current);
      continue;
    }

    if (/summary|profile|about|objective/.test(name)) {
      notes.push(section.body.slice(0, 6).join(" "));
      continue;
    }
  }

  // Fallback: scan whole doc for job-like headers if experience section missing
  if (!experiences.length) {
    const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
    let current: ParsedCareerHistory["experiences"][number] | null = null;
    for (const line of lines) {
      if (isJobHeader(line)) {
        if (current) experiences.push(current);
        const { title, company } = parseJobHeader(line);
        current = { title, company, bullets: [], raw: line };
      } else if (current && /^[-*•]/.test(line)) {
        current.bullets.push(line.replace(/^[-*•]\s*/, "").trim());
      }
    }
    if (current) experiences.push(current);
  }

  if (!experiences.length && !projects.length && !skills.length) {
    notes.push(text.slice(0, 2000));
  }

  return {
    experiences: experiences.slice(0, 12),
    skills: [...new Set(skills.map((s) => s.trim()).filter(Boolean))].slice(0, 80),
    projects: projects.slice(0, 10),
    notes,
  };
}

export function parseResumeText(raw: string): ParsedResume {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const meta = extractHeaderMeta(text);

  // Prefer markdown structure when present
  if (/^#{1,3}\s+/m.test(text)) {
    const md = parseCareerHistoryMarkdown(text);
    return { ...md, ...meta };
  }

  return { ...parsePlainResume(text), ...meta };
}
