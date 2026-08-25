/**
 * Aggregator job APIs — pull listings that often also appear on Indeed/Glassdoor
 * without scraping those antibot sites directly.
 */

export type AggregatorCandidate = {
  title: string;
  company: string;
  url: string;
  location: string;
  description: string;
  source: string;
};

/** Design/tech boards only — NOT used for Adzuna (user target roles drive that). */
const DESIGN_TITLE_HINTS =
  /ux[/ ]?ui|ui[/ ]?ux|ux engineer|ui engineer|ux designer|ui designer|product designer|design engineer|frontend|front[- ]?end|product engineer|creative technologist|prototyp|interaction designer|applied ai|design systems|visual designer|digital designer|web designer|experience designer/i;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Map market tokens → Adzuna country codes. */
export function adzunaCountriesForMarkets(marketTokens: string[]): string[] {
  const blob = marketTokens.join(" ").toLowerCase();
  const codes = new Set<string>();
  if (/\bireland\b|\bdublin\b|\bcork\b|\bgalway\b|\blimerick\b|\bie\b/.test(blob)) codes.add("ie");
  if (/\bunited kingdom\b|\buk\b|\blondon\b|\bbritain\b|\bmanchester\b|\bedinburgh\b/.test(blob)) {
    codes.add("gb");
  }
  if (/\bunited states\b|\busa\b|\bnew york\b|\bsan francisco\b|\bseattle\b|\baustin\b/.test(blob)) {
    codes.add("us");
  }
  if (/\bcanada\b|\btoronto\b|\bvancouver\b|\bmontreal\b/.test(blob)) codes.add("ca");
  if (/\bgermany\b|\bberlin\b|\bmunich\b|\bhamburg\b/.test(blob)) codes.add("de");
  if (/\bnetherlands\b|\bamsterdam\b/.test(blob)) codes.add("nl");
  if (/\bfrance\b|\bparis\b/.test(blob)) codes.add("fr");
  if (/\bspain\b|\bmadrid\b|\bbarcelona\b/.test(blob)) codes.add("es");
  if (/\bindia\b|\bdelhi\b|\bmumbai\b|\bbengaluru\b|\bbangalore\b/.test(blob)) codes.add("in");
  if (/\bsingapore\b/.test(blob)) codes.add("sg");
  if (/\baustralia\b|\bsydney\b|\bmelbourne\b/.test(blob)) codes.add("au");
  if (!codes.size) codes.add("ie");
  return [...codes].slice(0, 3);
}

/**
 * Adzuna — BYOK app id/key.
 * Does NOT apply design-only title filters; discover applies the user's target roles.
 */
export async function fetchAdzunaJobs(
  queries: string[],
  opts: { appId: string; appKey: string; marketTokens?: string[] },
): Promise<AggregatorCandidate[]> {
  const appId = opts.appId?.trim();
  const appKey = opts.appKey?.trim();
  if (!appId || !appKey) return [];

  const tokens = (opts.marketTokens ?? []).map((t) => t.toLowerCase()).filter((t) => t.length >= 2);
  const countries = adzunaCountriesForMarkets(tokens);
  const out: AggregatorCandidate[] = [];
  const seen = new Set<string>();
  const roleQs = queries
    .slice(0, 5)
    .map((q) => q.replace(/\s*\/\s*/g, " ").trim())
    .filter((q) => q.length >= 2);

  for (const country of countries) {
    for (const what of roleQs) {
      try {
        const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
        url.searchParams.set("app_id", appId);
        url.searchParams.set("app_key", appKey);
        url.searchParams.set("what", what);
        if (country === "ie") url.searchParams.set("where", "Dublin");
        url.searchParams.set("results_per_page", "50");
        url.searchParams.set("content-type", "application/json");

        const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) {
          console.warn(`[adzuna] ${country} HTTP ${res.status} what=${what}`);
          continue;
        }
        const data = (await res.json()) as {
          results?: {
            id: string;
            title: string;
            company?: { display_name?: string };
            location?: { display_name?: string; area?: string[] };
            description?: string;
            redirect_url?: string;
            adref?: string;
          }[];
        };

        for (const job of data.results ?? []) {
          const locParts = `${job.location?.display_name ?? ""} ${(job.location?.area ?? []).join(" ")}`.trim();
          const link = job.redirect_url ?? job.adref;
          if (!link || seen.has(link)) continue;
          seen.add(link);

          out.push({
            title: job.title,
            company: job.company?.display_name ?? "Unknown",
            url: link,
            location: locParts || (country === "ie" ? "Dublin, Ireland" : country.toUpperCase()),
            description: stripHtml(
              job.description ?? `${job.title}\n${job.company?.display_name ?? ""}`,
            ).slice(0, 40000),
            source: `adzuna:${country}`,
          });
        }
      } catch (err) {
        console.warn("[adzuna] query failed", country, what, err);
      }
    }
  }

  return out;
}

/** @deprecated Prefer fetchAdzunaJobs with explicit keys */
export async function fetchAdzunaIreland(queries: string[]): Promise<AggregatorCandidate[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return [];
  return fetchAdzunaJobs(queries, { appId, appKey, marketTokens: ["ireland", "dublin"] });
}

/** Remotive public remote jobs API (no key) — filter EU/Ireland-friendly */
export async function fetchRemotiveDesign(): Promise<AggregatorCandidate[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=design", {
      signal: AbortSignal.timeout(20000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      jobs?: {
        id: number;
        title: string;
        company_name: string;
        url: string;
        candidate_required_location?: string;
        description?: string;
      }[];
    };

    const out: AggregatorCandidate[] = [];
    for (const job of data.jobs ?? []) {
      if (!DESIGN_TITLE_HINTS.test(job.title)) continue;
      const loc = (job.candidate_required_location ?? "").toLowerCase();
      if (!/europe|emea|ireland|dublin|\beu\b|uk|united kingdom/.test(loc)) continue;
      if (/\bunited states\b|\busa only\b|\bus only\b/.test(loc) && !/europe|ireland|emea/.test(loc)) {
        continue;
      }
      out.push({
        title: job.title,
        company: job.company_name,
        url: job.url,
        location: job.candidate_required_location || "Remote",
        description: stripHtml(job.description ?? "").slice(0, 40000),
        source: "remotive",
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Arbeitnow public EU job board API (no key) */
export async function fetchArbeitnow(): Promise<AggregatorCandidate[]> {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      signal: AbortSignal.timeout(20000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: {
        slug: string;
        title: string;
        company_name: string;
        url: string;
        location: string;
        description: string;
        tags?: string[];
      }[];
    };

    const out: AggregatorCandidate[] = [];
    for (const job of data.data ?? []) {
      const blob = `${job.title} ${(job.tags ?? []).join(" ")}`;
      if (!DESIGN_TITLE_HINTS.test(blob)) continue;
      const loc = `${job.location}`.toLowerCase();
      if (
        !/\bireland\b|\bdublin\b|\bremote\b|\beurope\b|\beu\b/.test(loc) &&
        !/\bireland\b|\bdublin\b/.test(job.description.toLowerCase())
      ) {
        continue;
      }
      out.push({
        title: job.title,
        company: job.company_name,
        url: job.url,
        location: job.location || "Europe",
        description: stripHtml(job.description).slice(0, 40000),
        source: "arbeitnow",
      });
    }
    return out;
  } catch {
    return [];
  }
}
