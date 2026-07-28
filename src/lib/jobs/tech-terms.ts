/** Shared tech / ATS keyword vocabulary for parse + score + CV↔JD overlap. */

export const TECH_KEYWORDS = [
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
  "Vue",
  "Angular",
  "Docker",
  "Kubernetes",
  "Swift",
  "Kotlin",
  "Java",
  "Rust",
  "Zustand",
  "Unity",
  "WebGL",
  "Apify",
  "SendGrid",
  "Cursor",
] as const;

/** Lowercase aliases used for corpus includes matching (score-job style). */
export const TECH_HINTS = [
  "react",
  "typescript",
  "javascript",
  "next.js",
  "nextjs",
  "tailwind",
  "figma",
  "python",
  "node.js",
  "nodejs",
  "aws",
  "azure",
  "gcp",
  "graphql",
  "vue",
  "angular",
  "swift",
  "kotlin",
  "java",
  "c++",
  "rust",
  "docker",
  "kubernetes",
  "playwright",
  "firebase",
  "streamlit",
  "accessibility",
  "design systems",
  "prototyping",
  "zustand",
  "unity",
  "webgl",
] as const;

export function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

export function textIncludesTerm(corpus: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return false;
  return corpus.includes(t);
}
