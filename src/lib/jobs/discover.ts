import { prisma } from "@/lib/db/prisma";
import { importAndScoreJob } from "@/lib/jobs/service";
import { inferYearsRequired } from "@/lib/scoring/hard-filters";
import { fetchAdzunaJobs, fetchArbeitnow, fetchRemotiveDesign } from "@/lib/jobs/aggregators";
import { checkBoardPresence, presenceSearchConfigured } from "@/lib/jobs/board-presence";
import { fetchIrelandWatchlist } from "@/lib/jobs/ireland-watchlist";
import { parseJsonArray } from "@/lib/utils";
import { getPrimaryUser } from "@/lib/auth/user";
import { resolveUserKeys } from "@/lib/byok/keys";
import {
  buildTitleHintRegex,
  buildExcludeTitleRegex,
  isPrimaryMarketHit,
  marketTokens,
  roleQueriesFromSettings,
} from "@/lib/jobs/discover-prefs";

const GREENHOUSE_BOARDS = [
  "intercom",
  "stripe",
  "hubspot",
  "gitlab",
  "cloudflare",
  "figma",
  "vercel",
  "brex",
  "airtable",
  "asana",
  "dropbox",
  "datadog",
  "twilio",
  "elastic",
  "mongodb",
  "okta",
  "hashicorp",
  "grafana",
  "sentry",
  "calendly",
  "miro",
  "canva",
  "zapier",
  "typeform",
  "hotjar",
  "browserstack",
  "shopify",
  "reddit",
  "discord",
  "duolingo",
  "notion",
  "airbnb",
  "coinbase",
  "robinhood",
  "doordash",
  "lyft",
  "pinterest",
  "square",
  "block",
  "klaviyo",
  "zendesk",
  "surveymonkey",
  "webflow",
  "contentful",
  "pendo",
  "amplitude",
  "mixpanel",
];

/** Lever company slugs with public JSON postings */
const LEVER_COMPANIES = [
  "netlify",
  "loom",
  "eventbrite",
  "spotify",
  "quillbot",
  "grammarly",
  "palantir",
  "wealthsimple",
  "shopify",
];

const ASHBY_BOARDS = [
  "linear",
  "notion",
  "ramp",
  "rippling",
  "mercury",
  "anthropic",
  "openai",
  "resend",
  "cursor",
  "vercel",
  "clerk",
  "supabase",
];

const SKIP_TITLE =
  /\b(staff|principal|director|head of|vp\b|vice president|chief|distinguished|fellow)\b/i;

export interface DiscoverResult {
  irelandCoreAdded: number;
  euSponsorshipAdded: number;
  skippedDuplicates: number;
  skippedFilters: number;
  errors: number;
  targetIreland: number;
  samples: { title: string; company: string; score: number; category: string }[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isEuSponsorship(loc: string, content: string, primaryTokens: string[]): boolean {
  const blob = `${loc} ${content}`.toLowerCase();
  if (primaryTokens.some((t) => t.length >= 3 && blob.includes(t))) return false;
  const eu =
    /\b(germany|berlin|netherlands|amsterdam|france|paris|spain|madrid|portugal|lisbon|belgium|brussels|sweden|stockholm|denmark|copenhagen|finland|austria|vienna|poland|warsaw|italy|milan|eu[- ]wide|europe|emea)\b/.test(
      blob,
    );
  const sponsor = /\bsponsor|visa|relocation|work permit|critical skills\b/.test(blob);
  return eu && sponsor;
}

async function fetchGreenhouse(board: string) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return [] as {
    id: number;
    title: string;
    absolute_url: string;
    location: { name: string };
    content?: string;
  }[];
  const data = (await res.json()) as {
    jobs?: {
      id: number;
      title: string;
      absolute_url: string;
      location: { name: string };
      content?: string;
    }[];
  };
  return data.jobs ?? [];
}

async function fetchAshby(board: string) {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${board}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return [] as {
    id: string;
    title: string;
    jobUrl: string;
    location?: string;
    descriptionHtml?: string;
    descriptionPlain?: string;
  }[];
  const data = (await res.json()) as {
    jobs?: {
      id: string;
      title: string;
      jobUrl: string;
      location?: string;
      descriptionHtml?: string;
      descriptionPlain?: string;
    }[];
  };
  return data.jobs ?? [];
}

function shouldSkipCandidate(
  title: string,
  description: string,
  titleHints: RegExp,
  excludeTitles: RegExp | null,
): boolean {
  if (SKIP_TITLE.test(title)) return true;
  if (excludeTitles?.test(title)) return true;
  if (!titleHints.test(title)) return true;
  const years = inferYearsRequired(description);
  if (years != null && years >= 8) return true;
  if (years != null && years >= 6 && /\bsenior\b/i.test(title)) return true;
  return false;
}

async function fetchLever(company: string) {
  const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return [] as {
    id: string;
    text: string;
    hostedUrl: string;
    categories?: { location?: string };
    descriptionPlain?: string;
    description?: string;
  }[];
  return (await res.json()) as {
    id: string;
    text: string;
    hostedUrl: string;
    categories?: { location?: string };
    descriptionPlain?: string;
    description?: string;
  }[];
}

export async function runJobDiscovery(options?: { target?: number }): Promise<DiscoverResult> {
  const user = await getPrimaryUser();
  if (!user?.settings) throw new Error("Seed the database first");

  const titleHints = buildTitleHintRegex(user.settings.targetRolesText);
  const excludeTitles = buildExcludeTitleRegex(user.settings.excludedRolesText);
  const tokens = marketTokens(user.settings);
  const roleQueries = roleQueriesFromSettings(user.settings.targetRolesText);
  const keys = await resolveUserKeys(user.id, { isOperator: user.isOperator });

  const target = options?.target ?? user.settings.dailyBatchTarget ?? 25;
  const existingUrls = new Set(
    (await prisma.job.findMany({ where: { userId: user.id }, select: { url: true } }))
      .map((j) => j.url)
      .filter((u): u is string => Boolean(u)),
  );

  let irelandCoreAdded = 0;
  let euSponsorshipAdded = 0;
  let skippedDuplicates = 0;
  let skippedFilters = 0;
  let errors = 0;
  const samples: DiscoverResult["samples"] = [];

  type Candidate = {
    title: string;
    company: string;
    url: string;
    location: string;
    description: string;
    source: string;
  };

  const candidates: Candidate[] = [];

  for (const board of GREENHOUSE_BOARDS) {
    try {
      const jobs = await fetchGreenhouse(board);
      for (const job of jobs) {
        const content = stripHtml(job.content ?? "");
        if (shouldSkipCandidate(job.title, `${job.title}\n${content}`, titleHints, excludeTitles)) {
          skippedFilters += 1;
          continue;
        }
        if (existingUrls.has(job.absolute_url)) {
          skippedDuplicates += 1;
          continue;
        }
        const loc = job.location?.name ?? "";
        candidates.push({
          title: job.title,
          company: board.charAt(0).toUpperCase() + board.slice(1),
          url: job.absolute_url,
          location: loc,
          description: `${job.title}\n${board}\n${loc}\n\n${content}`.slice(0, 40000),
          source: `greenhouse:${board}`,
        });
      }
    } catch {
      errors += 1;
    }
  }

  for (const company of LEVER_COMPANIES) {
    try {
      const jobs = await fetchLever(company);
      for (const job of jobs) {
        const content = job.descriptionPlain ?? stripHtml(job.description ?? "");
        if (shouldSkipCandidate(job.text, `${job.text}\n${content}`, titleHints, excludeTitles)) {
          skippedFilters += 1;
          continue;
        }
        if (existingUrls.has(job.hostedUrl)) {
          skippedDuplicates += 1;
          continue;
        }
        const loc = job.categories?.location ?? "";
        candidates.push({
          title: job.text,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          url: job.hostedUrl,
          location: loc,
          description: `${job.text}\n${company}\n${loc}\n\n${content}`.slice(0, 40000),
          source: `lever:${company}`,
        });
      }
    } catch {
      errors += 1;
    }
  }

  for (const board of ASHBY_BOARDS) {
    try {
      const jobs = await fetchAshby(board);
      for (const job of jobs) {
        const content = job.descriptionPlain ?? stripHtml(job.descriptionHtml ?? "");
        if (shouldSkipCandidate(job.title, `${job.title}\n${content}`, titleHints, excludeTitles)) {
          skippedFilters += 1;
          continue;
        }
        if (existingUrls.has(job.jobUrl)) {
          skippedDuplicates += 1;
          continue;
        }
        const loc = job.location ?? "";
        candidates.push({
          title: job.title,
          company: board.charAt(0).toUpperCase() + board.slice(1),
          url: job.jobUrl,
          location: loc,
          description: `${job.title}\n${board}\n${loc}\n\n${content}`.slice(0, 40000),
          source: `ashby:${board}`,
        });
      }
    } catch {
      errors += 1;
    }
  }

  try {
    const adzuna = keys.hasAdzuna
      ? await fetchAdzunaJobs(roleQueries, {
          appId: keys.adzunaAppId!,
          appKey: keys.adzunaAppKey!,
          marketTokens: tokens,
        })
      : [];
    const useIrelandWatchlist =
      user.isOperator || tokens.some((t) => /ireland|dublin/.test(t));
    const [remotive, arbeitnow, watchlist] = await Promise.all([
      fetchRemotiveDesign(),
      fetchArbeitnow(),
      useIrelandWatchlist ? fetchIrelandWatchlist() : Promise.resolve([]),
    ]);
    for (const job of [...watchlist, ...adzuna, ...remotive, ...arbeitnow]) {
      if (shouldSkipCandidate(job.title, `${job.title}\n${job.description}`, titleHints, excludeTitles)) {
        skippedFilters += 1;
        continue;
      }
      if (existingUrls.has(job.url)) {
        skippedDuplicates += 1;
        continue;
      }
      candidates.push(job);
    }
  } catch {
    errors += 1;
  }

  candidates.sort((a, b) => {
    const score = (c: Candidate) => {
      const t = `${c.title} ${c.location} ${c.description}`.toLowerCase();
      let s = 0;
      if (c.source.startsWith("watchlist:")) s += 8;
      if (c.source.startsWith("adzuna:")) s += 5;
      for (const tok of tokens) {
        if (tok.length >= 3 && t.includes(tok)) s += 4;
      }
      if (titleHints.test(c.title)) s += 3;
      if (/\bsenior\b/.test(c.title.toLowerCase())) s -= 3;
      return s;
    };
    return score(b) - score(a);
  });

  const presenceKeys = {
    brave: keys.brave,
    serp: keys.serpapi,
  };

  for (const c of candidates) {
    if (irelandCoreAdded >= target) break;

    const eu = isEuSponsorship(c.location, c.description, tokens);
    const primary = isPrimaryMarketHit(c.location, c.description, tokens);
    if (!eu && !primary) {
      skippedFilters += 1;
      continue;
    }

    if (!eu && irelandCoreAdded >= target) continue;

    try {
      const saved = await importAndScoreJob({
        description: c.description,
        url: c.url,
        title: c.title,
        company: c.company,
        source: c.source,
        listingCategory: eu ? "eu_sponsorship" : "ireland_core",
      });
      existingUrls.add(c.url);

      if (presenceSearchConfigured(presenceKeys) && saved.status !== "rejected") {
        const presence = await checkBoardPresence(
          {
            title: c.title,
            company: c.company,
            location: c.location,
          },
          presenceKeys,
        );
        if (presence.checked) {
          const prior = parseJsonArray<{ code: string; message: string; severity: string }>(
            saved.softFlagsJson ?? "[]",
          );
          prior.push({
            code: "board_presence",
            message:
              presence.boards.length > 0
                ? `Also indexed on ${presence.boards.join(", ")} (search verify)`
                : "Not found on LinkedIn/Indeed/Glassdoor index — company-site only",
            severity: presence.boards.length > 0 ? "info" : "warn",
          });
          await prisma.job.update({
            where: { id: saved.id },
            data: { softFlagsJson: JSON.stringify(prior) },
          });
        }
      }

      const score = saved.score?.totalScore ?? 0;
      if (eu) {
        euSponsorshipAdded += 1;
        samples.push({ title: c.title, company: c.company, score, category: "eu_sponsorship" });
      } else {
        if (saved.status !== "rejected") irelandCoreAdded += 1;
        samples.push({ title: c.title, company: c.company, score, category: "ireland_core" });
      }
    } catch {
      errors += 1;
    }
  }

  return {
    irelandCoreAdded,
    euSponsorshipAdded,
    skippedDuplicates,
    skippedFilters,
    errors,
    targetIreland: target,
    samples: samples.slice(0, 15),
  };
}
