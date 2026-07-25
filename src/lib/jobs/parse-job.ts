import type { Requirement } from "@/lib/types";
import { inferYearsRequired } from "@/lib/scoring/hard-filters";

export interface ParsedJobFields {
  company: string;
  title: string;
  location?: string;
  country?: string;
  remoteType?: "onsite" | "hybrid" | "remote" | "unknown";
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  seniority?: string;
  yearsRequired?: number;
  sponsorshipText?: string;
  workAuthorizationText?: string;
  requirements: Requirement[];
  responsibilities: string[];
  keywords: string[];
  descriptionClean: string;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectRemoteType(text: string): ParsedJobFields["remoteType"] {
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return "hybrid";
  if (/\bremote\b/.test(t)) return "remote";
  if (/\bon[-\s]?site\b|\bin[-\s]?office\b/.test(t)) return "onsite";
  return "unknown";
}

function detectYears(text: string): number | undefined {
  return inferYearsRequired(text);
}

function detectSalary(text: string): {
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
} {
  const euroRange = text.match(/€\s?(\d{2,3})[,.]?(\d{3})?\s?[-–to]+\s?€?\s?(\d{2,3})[,.]?(\d{3})?/i);
  if (euroRange) {
    const min = Number(`${euroRange[1]}${euroRange[2] ?? ""}`);
    const max = Number(`${euroRange[3]}${euroRange[4] ?? ""}`);
    return { salaryMin: min, salaryMax: max, salaryCurrency: "EUR" };
  }
  const single = text.match(/€\s?(\d{2,3})[,.]?(\d{3})/i);
  if (single) {
    const v = Number(`${single[1]}${single[2] ?? ""}`);
    return { salaryMin: v, salaryMax: v, salaryCurrency: "EUR" };
  }
  return {};
}

function extractSectionBullets(text: string, headers: RegExp[]): string[] {
  const lines = text.split("\n");
  const bullets: string[] = [];
  let capturing = false;

  for (const line of lines) {
    if (headers.some((h) => h.test(line.trim()))) {
      capturing = true;
      continue;
    }
    if (capturing && /^[A-Z][A-Za-z ]{2,40}$/.test(line.trim()) && !/^[-•*]/.test(line.trim())) {
      // possible next section heading
      if (!/^(and|or|with)\b/i.test(line.trim())) {
        capturing = false;
      }
    }
    if (capturing) {
      const cleaned = line.replace(/^[-•*\d.)\s]+/, "").trim();
      if (cleaned.length > 8) bullets.push(cleaned);
    }
  }
  return bullets.slice(0, 40);
}

const TECH_KEYWORDS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Next.js",
  "Node.js",
  "Python",
  "Figma",
  "Tailwind",
  "CSS",
  "HTML",
  "AWS",
  "Azure",
  "GCP",
  "GraphQL",
  "REST",
  "Accessibility",
  "Design systems",
  "UX",
  "UI",
  "Prototyping",
  "Playwright",
  "Firebase",
  "Streamlit",
  "AI",
  "Automation",
];

export function parseJobText(input: {
  description: string;
  title?: string;
  company?: string;
  url?: string;
}): ParsedJobFields {
  const descriptionClean = cleanText(input.description);
  const lines = descriptionClean.split("\n").map((l) => l.trim()).filter(Boolean);
  const title =
    input.title?.trim() ||
    lines[0] ||
    "Untitled role";

  let company = input.company?.trim() || "Unknown company";
  if (company === "Unknown company") {
    const companyLine = lines.find(
      (l, i) =>
        i > 0 &&
        i < 4 &&
        l.length < 60 &&
        !/^(location|salary|about|employment|requirements|responsibilities)/i.test(l) &&
        !/^https?:/i.test(l),
    );
    if (companyLine && companyLine !== title) company = companyLine;
  }
  if (company === "Unknown company" && input.url) {
    try {
      const host = new URL(input.url).hostname.replace(/^www\./, "");
      company = host.split(".")[0] ?? company;
      company = company.charAt(0).toUpperCase() + company.slice(1);
    } catch {
      /* ignore */
    }
  }

  const reqBullets = extractSectionBullets(descriptionClean, [
    /^requirements?/i,
    /^what (you'|you’ll|you'll|we) (need|look|bring)/i,
    /^about you/i,
    /^must[-\s]?have/i,
    /^qualifications?/i,
    /^skills?/i,
  ]);
  const respBullets = extractSectionBullets(descriptionClean, [
    /^responsibilities?/i,
    /^what you('|’)ll do/i,
    /^the role/i,
    /^about the (role|job)/i,
    /^key duties/i,
  ]);

  const requirements: Requirement[] = reqBullets.map((text) => ({
    text,
    kind: /nice to have|preferred|bonus/i.test(text) ? "preferred" : "required",
  }));

  const keywords = TECH_KEYWORDS.filter((k) =>
    descriptionClean.toLowerCase().includes(k.toLowerCase()),
  );

  const salary = detectSalary(descriptionClean);
  const yearsRequired = detectYears(descriptionClean);

  const sponsorshipMatch = descriptionClean.match(/[^.]*sponsor[^.]*\./i);
  const workAuthMatch = descriptionClean.match(/[^.]*((work (authorization|authorisation|permit|visa)|right to work)[^.]*\.)/i);

  const locationLine = descriptionClean
    .split("\n")
    .map((l) => l.trim())
    .find((l) => /\bdublin\b|\bireland\b|\bremote\b|\bhybrid\b/i.test(l) && l.length < 80);

  return {
    company,
    title,
    location: locationLine,
    country: /\bireland\b/i.test(descriptionClean) ? "Ireland" : undefined,
    remoteType: detectRemoteType(descriptionClean),
    employmentType: /\bpermanent\b/i.test(descriptionClean)
      ? "Permanent"
      : /\bfixed[-\s]?term\b/i.test(descriptionClean)
        ? "Fixed-term"
        : /\bcontract\b/i.test(descriptionClean)
          ? "Contract"
          : undefined,
    ...salary,
    seniority: /\bjunior\b/i.test(title)
      ? "junior"
      : /\bsenior\b/i.test(title)
        ? "senior"
        : /\blead\b/i.test(title)
          ? "lead"
          : "mid",
    yearsRequired,
    sponsorshipText: sponsorshipMatch?.[0]?.trim(),
    workAuthorizationText: workAuthMatch?.[0]?.trim(),
    requirements,
    responsibilities: respBullets,
    keywords,
    descriptionClean,
  };
}
