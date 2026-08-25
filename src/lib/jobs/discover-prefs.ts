import { parseJsonArray } from "@/lib/utils";

const DEFAULT_TITLE_HINTS =
  /ux[/ ]?ui|ui[/ ]?ux|ux engineer|ui engineer|ux designer|ui designer|product designer|design engineer|frontend|front[- ]?end|product engineer|creative technologist|prototyp|interaction designer|applied ai|design systems|visual designer|digital designer|web designer|experience designer|service designer|software engineer|full[- ]?stack|backend|data engineer|product manager|analyst|developer/i;

export function buildTitleHintRegex(targetRolesText: string | null | undefined): RegExp {
  const parts = (targetRolesText ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!parts.length) return DEFAULT_TITLE_HINTS;
  try {
    return new RegExp(parts.join("|"), "i");
  } catch {
    return DEFAULT_TITLE_HINTS;
  }
}

export function buildExcludeTitleRegex(excludedRolesText: string | null | undefined): RegExp | null {
  const parts = (excludedRolesText ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!parts.length) return null;
  try {
    return new RegExp(parts.join("|"), "i");
  } catch {
    return null;
  }
}

export function marketTokens(settings: {
  marketsJson?: string | null;
  primaryMarketLabel?: string | null;
  location?: string | null;
  allowedLocationsJson?: string | null;
}): string[] {
  const fromJson = parseJsonArray<string>(settings.marketsJson ?? "[]");
  const allowed = parseJsonArray<string>(settings.allowedLocationsJson ?? "[]");
  const extras = [settings.primaryMarketLabel, settings.location]
    .filter(Boolean)
    .map((s) => String(s));
  const all = [...fromJson, ...allowed, ...extras]
    .flatMap((s) => s.split(/[,/|]/))
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 2);
  return [...new Set(all)];
}

export function isPrimaryMarketHit(loc: string, content: string, tokens: string[]): boolean {
  if (!tokens.length) {
    // Legacy Ireland default when nothing configured (operator seed)
    const blob = `${loc} ${content}`.toLowerCase();
    return /\bireland\b|\bdublin\b|\bcork\b|\bgalway\b/.test(blob);
  }
  const blob = `${loc} ${content}`.toLowerCase();
  return tokens.some((t) => t.length >= 3 && blob.includes(t));
}

export function roleQueriesFromSettings(targetRolesText: string | null | undefined): string[] {
  const parts = (targetRolesText ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length) return parts.slice(0, 8);
  return ["Software Engineer", "Frontend Developer", "Product Designer", "UX Designer"];
}
