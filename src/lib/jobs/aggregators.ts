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

const TITLE_HINTS =
  /ux[/ ]?ui|ui[/ ]?ux|ux engineer|ui engineer|ux designer|ui designer|product designer|design engineer|frontend|front[- ]?end|product engineer|creative technologist|prototyp|interaction designer|applied ai|design systems|visual designer|digital designer|web designer|experience designer/i;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Adzuna — no `ie` country code. GB index + Dublin/Ireland in query, then filter. */
export async function fetchAdzunaIreland(queries: string[]): Promise<AggregatorCandidate[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return [];

  const out: AggregatorCandidate[] = [];
  const seen = new Set<string>();
  // `where=Dublin` returns empty on GB index; bake location into `what` instead
  const searchTerms = queries.flatMap((q) => [`${q} Dublin`, `${q} Ireland`]);

  for (const what of searchTerms) {
    try {
      const url = new URL("https://api.adzuna.com/v1/api/jobs/gb/search/1");
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("what", what);
      url.searchParams.set("results_per_page", "50");
      url.searchParams.set("content-type", "application/json");

      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) continue;
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
        if (!TITLE_HINTS.test(job.title)) continue;
        const loc = `${job.location?.display_name ?? ""} ${(job.location?.area ?? []).join(" ")}`;
        const blob = `${job.title} ${loc} ${job.description ?? ""}`.toLowerCase();
        const irelandHit = /\bireland\b|\bdublin\b|\bcork\b|\bgalway\b|\blimerick\b/.test(blob);
        if (!irelandHit) continue;

        const link = job.redirect_url ?? job.adref;
        if (!link || seen.has(link)) continue;
        seen.add(link);

        out.push({
          title: job.title,
          company: job.company?.display_name ?? "Unknown",
          url: link,
          location: job.location?.display_name ?? "Ireland",
          description: stripHtml(
            job.description ?? `${job.title}\n${job.company?.display_name ?? ""}`,
          ).slice(0, 40000),
          source: "adzuna:gb-ireland",
        });
      }
    } catch {
      /* skip query */
    }
  }

  return out;
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
      if (!TITLE_HINTS.test(job.title)) continue;
      const loc = (job.candidate_required_location ?? "").toLowerCase();
      // Skip US-only and vague worldwide — keep Europe/Ireland/EMEA remotes
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
      if (!TITLE_HINTS.test(blob)) continue;
      const loc = `${job.location}`.toLowerCase();
      if (!/\bireland\b|\bdublin\b|\bremote\b|\beurope\b|\beu\b/.test(loc) && !/\bireland\b|\bdublin\b/.test(job.description.toLowerCase())) {
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
