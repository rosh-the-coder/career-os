/**
 * Parse optional ChatGPT-exported career history markdown into draft inventory slots.
 * Never invents metrics — extracts headings and bullet lines only.
 */

export type ParsedCareerHistory = {
  experiences: { company: string; title: string; bullets: string[]; raw: string }[];
  skills: string[];
  projects: { name: string; bullets: string[] }[];
  notes: string[];
};

export function parseCareerHistoryMarkdown(md: string): ParsedCareerHistory {
  const text = md.replace(/\r\n/g, "\n").trim();
  const experiences: ParsedCareerHistory["experiences"] = [];
  const projects: ParsedCareerHistory["projects"] = [];
  const skills: string[] = [];
  const notes: string[] = [];

  const sections = text.split(/\n(?=#{1,3}\s+)/);
  for (const section of sections) {
    const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const heading = lines[0].replace(/^#+\s*/, "").trim();
    const body = lines.slice(1);
    const bullets = body
      .filter((l) => /^[-*•]/.test(l) || /^\d+\./.test(l))
      .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    const h = heading.toLowerCase();
    if (/skill/.test(h)) {
      const fromCsv = body
        .join(" ")
        .split(/[,|•]/)
        .map((s) => s.replace(/^[-*]\s*/, "").trim())
        .filter((s) => s.length > 1 && s.length < 60);
      skills.push(...(bullets.length ? bullets : fromCsv));
      continue;
    }
    if (/project|portfolio|build/.test(h)) {
      projects.push({ name: heading, bullets });
      continue;
    }
    if (
      /experience|work|employment|career|role|job/.test(h) ||
      /\d{4}/.test(heading) ||
      /[—\-@|]/.test(heading) ||
      (bullets.length > 0 && !/^#\s/.test(lines[0]))
    ) {
      // Skip bare section labels like "# Experience" with no role line
      if (!bullets.length && /^(experience|work history|employment|career|roles?|jobs?)$/i.test(heading)) {
        continue;
      }
      if (/career inventory/i.test(heading)) {
        continue;
      }
      const titleMatch = heading.match(/^(.+?)\s+[—\-@|]\s+(.+)$/);
      experiences.push({
        company: titleMatch ? titleMatch[2].trim() : heading,
        title: titleMatch ? titleMatch[1].trim() : heading,
        bullets,
        raw: section,
      });
      continue;
    }
    if (bullets.length) {
      notes.push(`${heading}: ${bullets.slice(0, 5).join("; ")}`);
    }
  }

  // Fallback: treat whole doc as notes if nothing structured
  if (!experiences.length && !projects.length && !skills.length) {
    notes.push(text.slice(0, 2000));
  }

  return {
    experiences,
    skills: [...new Set(skills)].slice(0, 80),
    projects,
    notes,
  };
}
