const BLOCKED_HOST_HINTS = [
  "indeed.com",
  "ie.indeed.com",
  "linkedin.com",
  "glassdoor.com",
  "glassdoor.ie",
  "irishjobs.ie",
  "jobs.ie",
];

export class JobFetchError extends Error {
  constructor(
    message: string,
    public code: "blocked" | "http_error" | "empty" | "network",
    public status?: number,
  ) {
    super(message);
    this.name = "JobFetchError";
  }
}

export function isLikelyBlockedJobHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return BLOCKED_HOST_HINTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchJobUrl(url: string): Promise<{ text: string; title?: string; fetchMode: "direct" | "blocked_skip" }> {
  if (isLikelyBlockedJobHost(url)) {
    throw new JobFetchError(
      "This site blocks automated fetching (Indeed/LinkedIn/Glassdoor/etc.). Paste the full job description below and keep the URL for tracking — that works and keeps your accounts safe.",
      "blocked",
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/json",
        "Accept-Language": "en-IE,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
  } catch {
    throw new JobFetchError(
      "Could not reach that URL. Paste the job description and keep the link for tracking.",
      "network",
    );
  }

  if (res.status === 403 || res.status === 401 || res.status === 429) {
    throw new JobFetchError(
      `The site refused automated access (${res.status}). Paste the job description and keep the URL — CareerOS will still score and track it.`,
      "blocked",
      res.status,
    );
  }

  if (!res.ok) {
    throw new JobFetchError(`Failed to fetch URL (${res.status}). Paste the description instead.`, "http_error", res.status);
  }

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim();

  const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldMatches) {
    try {
      const data = JSON.parse(m[1]!) as Record<string, unknown> | Record<string, unknown>[];
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = item["@type"];
        if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
          const org =
            item.hiringOrganization && typeof item.hiringOrganization === "object"
              ? ((item.hiringOrganization as { name?: string }).name ?? "")
              : "";
          const desc = String(item.description ?? "")
            .replace(/<[^>]+>/g, "\n")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&");
          return {
            text: cleanText(`${item.title ?? ""}\n${org}\n${desc}`),
            title: String(item.title ?? title ?? "Job"),
            fetchMode: "direct",
          };
        }
      }
    } catch {
      /* continue */
    }
  }

  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

  const text = cleanText(stripped).slice(0, 50000);
  if (text.length < 80) {
    throw new JobFetchError(
      "Fetched page had almost no job text. Paste the description manually and keep the URL.",
      "empty",
    );
  }

  return { text, title, fetchMode: "direct" };
}
