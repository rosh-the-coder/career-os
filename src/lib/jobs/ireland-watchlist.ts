/**
 * Niche Irish / Dublin employers that often post on their own site
 * (and only syndicate to LinkedIn/Glassdoor) — not Greenhouse/Lever.
 * Discovery polls these career pages directly.
 */

export type CareerWatch = {
  company: string;
  careersUrl: string;
  /** Optional regex to keep only matching role links */
  titleHint?: RegExp;
};

export const IRELAND_CAREER_WATCHLIST: CareerWatch[] = [
  { company: "Kooba", careersUrl: "https://www.kooba.ie/careers" },
  { company: "Distilled", careersUrl: "https://www.distilled.ie/careers" },
  { company: "Arekibo", careersUrl: "https://www.arekibo.com/careers" },
  { company: "Fuse Digital", careersUrl: "https://www.fusedigital.ie/careers" },
  { company: "Softworks", careersUrl: "https://www.softworks.com/careers/" },
  { company: "Workday Dublin", careersUrl: "https://www.workday.com/en-us/company/careers/open-positions.html#location=dublin" },
  { company: "Accenture Ireland", careersUrl: "https://www.accenture.com/ie-en/careers/jobsearch" },
  { company: "Version 1", careersUrl: "https://www.version1.com/careers/" },
  { company: "Ergo", careersUrl: "https://www.ergogroup.ie/careers/" },
  { company: "Evros", careersUrl: "https://www.evros.ie/careers/" },
  { company: "NearForm", careersUrl: "https://www.nearform.com/careers/" },
  { company: "Zalando Dublin", careersUrl: "https://jobs.zalando.com/en/jobs/?locations=Dublin" },
  { company: "Ryanair", careersUrl: "https://careers.ryanair.com/jobs/" },
  { company: "CircleCI", careersUrl: "https://circleci.com/careers/" },
];

const ROLE_HINT =
  /ux|ui|design|frontend|front-end|product engineer|creative|prototyp|interaction|visual|digital designer/i;

const SKIP =
  /\b(staff|principal|director|head of|vp\b|vice president|chief|account manager|sales|recruiter)\b/i;

function absolutize(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export type WatchlistHit = {
  title: string;
  company: string;
  url: string;
  location: string;
  description: string;
  source: string;
};

/** Fetch a careers HTML page and extract likely design/UX role links. */
export async function scrapeCareerPage(watch: CareerWatch): Promise<WatchlistHit[]> {
  try {
    const res = await fetch(watch.careersUrl, {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (compatible; CareerOS/1.0; +https://github.com/rosh-the-coder/career-os)",
      },
      signal: AbortSignal.timeout(18000),
      redirect: "follow",
    });
    if (!res.ok) return [];
    const html = await res.text();
    const hits: WatchlistHit[] = [];
    const seen = new Set<string>();

    // <a href="...">Title</a>
    const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) !== null) {
      const href = m[1];
      const rawTitle = stripHtml(m[2]);
      if (!rawTitle || rawTitle.length < 4 || rawTitle.length > 120) continue;
      if (!ROLE_HINT.test(rawTitle) && !ROLE_HINT.test(href)) continue;
      if (SKIP.test(rawTitle)) continue;
      if (/^(home|careers|about|contact|blog|login|apply now)$/i.test(rawTitle)) continue;

      const url = absolutize(href, watch.careersUrl);
      if (!url || seen.has(url)) continue;
      // Stay on same site when possible
      try {
        const host = new URL(url).hostname;
        const baseHost = new URL(watch.careersUrl).hostname.replace(/^www\./, "");
        if (!host.includes(baseHost.split(".").slice(-2).join(".")) && !/job|career|greenhouse|lever|ashby|workday/i.test(host)) {
          continue;
        }
      } catch {
        continue;
      }

      seen.add(url);
      hits.push({
        title: rawTitle,
        company: watch.company,
        url,
        location: "Dublin, Ireland",
        description: `${rawTitle}\n${watch.company}\nDublin, Ireland\n\nSource careers page: ${watch.careersUrl}\nListing: ${url}\n\nOpen the listing for full JD — niche Irish employer watchlist.`,
        source: `watchlist:${watch.company.toLowerCase().replace(/\s+/g, "_")}`,
      });
    }

    // If page itself is a single role (title in <h1>)
    if (hits.length === 0) {
      const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = h1 ? stripHtml(h1[1]) : "";
      if (title && ROLE_HINT.test(title) && !SKIP.test(title)) {
        hits.push({
          title,
          company: watch.company,
          url: watch.careersUrl,
          location: "Dublin, Ireland",
          description: `${title}\n${watch.company}\nDublin\n\n${stripHtml(html).slice(0, 8000)}`,
          source: `watchlist:${watch.company.toLowerCase().replace(/\s+/g, "_")}`,
        });
      }
    }

    return hits.slice(0, 12);
  } catch {
    return [];
  }
}

export async function fetchIrelandWatchlist(): Promise<WatchlistHit[]> {
  const batches = await Promise.all(
    IRELAND_CAREER_WATCHLIST.map((w) => scrapeCareerPage(w)),
  );
  return batches.flat();
}
