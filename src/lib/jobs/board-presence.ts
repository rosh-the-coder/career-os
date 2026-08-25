/**
 * Board presence check via web search index — does NOT scrape LinkedIn/Glassdoor/Indeed HTML.
 * Uses Brave Search or SerpAPI if configured. Marks whether a role appears indexed on those sites.
 */

export type PresenceBoard = "linkedin" | "indeed" | "glassdoor";

export interface BoardPresenceResult {
  checked: boolean;
  boards: PresenceBoard[];
  query: string;
  note?: string;
}

export type PresenceKeys = {
  brave?: string;
  serp?: string;
};

function envSearchKeys(): PresenceKeys {
  return {
    brave: process.env.BRAVE_SEARCH_API_KEY?.trim(),
    serp: process.env.SERPAPI_KEY?.trim(),
  };
}

export function presenceSearchConfigured(keys?: PresenceKeys): boolean {
  const k = keys ?? envSearchKeys();
  return Boolean(k.brave || k.serp);
}

async function searchWeb(query: string, keys: PresenceKeys): Promise<string[]> {
  const snippets: string[] = [];

  if (keys.brave) {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "8");
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": keys.brave,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        web?: { results?: { url?: string; title?: string; description?: string }[] };
      };
      for (const r of data.web?.results ?? []) {
        snippets.push(`${r.url ?? ""} ${r.title ?? ""} ${r.description ?? ""}`);
      }
    }
    return snippets;
  }

  if (keys.serp) {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", keys.serp);
    url.searchParams.set("num", "8");
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const data = (await res.json()) as {
        organic_results?: { link?: string; title?: string; snippet?: string }[];
      };
      for (const r of data.organic_results ?? []) {
        snippets.push(`${r.link ?? ""} ${r.title ?? ""} ${r.snippet ?? ""}`);
      }
    }
  }

  return snippets;
}

function detectBoards(blob: string): PresenceBoard[] {
  const found = new Set<PresenceBoard>();
  const lower = blob.toLowerCase();
  if (/linkedin\.com\/jobs|linkedin\.com\/.*job/i.test(lower)) found.add("linkedin");
  if (/indeed\.com|ie\.indeed\.com/i.test(lower)) found.add("indeed");
  if (/glassdoor\.(com|ie)/i.test(lower)) found.add("glassdoor");
  return [...found];
}

/** Check whether search engines index this role on LinkedIn / Indeed / Glassdoor. */
export async function checkBoardPresence(
  input: {
    title: string;
    company: string;
    location?: string;
  },
  keys?: PresenceKeys,
): Promise<BoardPresenceResult> {
  const resolved = keys ?? envSearchKeys();
  if (!presenceSearchConfigured(resolved)) {
    return {
      checked: false,
      boards: [],
      query: "",
      note: "Add Brave or SerpAPI in Settings to verify LinkedIn/Indeed/Glassdoor presence via search index.",
    };
  }

  const loc = input.location?.split(/[,;]/)[0]?.trim() || "";
  const locClause = loc ? `(${loc})` : "";
  const query = `"${input.title}" "${input.company}" ${locClause} (site:linkedin.com/jobs OR site:indeed.com OR site:ie.indeed.com OR site:glassdoor.com OR site:glassdoor.ie)`;

  try {
    const snippets = await searchWeb(query, resolved);
    const boards = detectBoards(snippets.join("\n"));
    return {
      checked: true,
      boards,
      query,
      note:
        boards.length > 0
          ? `Indexed on: ${boards.join(", ")}`
          : "No LinkedIn/Indeed/Glassdoor index hit for this title+company (may still be real on company career site).",
    };
  } catch (err) {
    return {
      checked: false,
      boards: [],
      query,
      note: err instanceof Error ? err.message : "Presence search failed",
    };
  }
}
