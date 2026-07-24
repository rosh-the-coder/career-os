import { prisma } from "@/lib/db/prisma";
import { importAndScoreJob } from "@/lib/jobs/service";

/**
 * Public Greenhouse board tokens useful for Dublin / Ireland product & design roles.
 * Expand this watchlist over time. Lever boards use a different API.
 */
const GREENHOUSE_BOARDS = [
  "intercom",
  "stripe",
  "hubspot",
  "gitlab",
  "cloudflare",
  "notion",
  "figma",
  "vercel",
  "linear",
  "ramp",
  "brex",
  "airtable",
  "asana",
  "dropbox",
  "boxinc",
];

const TITLE_HINTS =
  /ux engineer|design engineer|product designer|frontend|front-end|product engineer|creative technologist|prototyp|interaction designer|ui engineer|applied ai|design systems|full.?stack.*design/i;

const SKIP_TITLE = /\b(staff|principal|director|head of|vp\b|vice president|chief)\b/i;

interface GhJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  updated_at: string;
  content?: string;
}

function isIrelandRelevant(loc: string, content: string): boolean {
  const blob = `${loc} ${content}`.toLowerCase();
  if (/\b(united states|usa|us only|uk only|london only)\b/.test(blob) && !/\bireland|dublin\b/.test(blob)) {
    return false;
  }
  return /\bireland\b|\bdublin\b|\beu\b|\beurope\b|\bremote\b/.test(blob) || loc.length < 3;
}

function isEuSponsorshipCandidate(loc: string, content: string): boolean {
  const blob = `${loc} ${content}`.toLowerCase();
  const ireland = /\bireland\b|\bdublin\b/.test(blob);
  const eu = /\b(germany|berlin|netherlands|amsterdam|france|paris|spain|portugal|belgium|sweden|denmark|eu|europe)\b/.test(
    blob,
  );
  const sponsor = /\bsponsor|visa|relocation|work permit\b/.test(blob);
  return !ireland && eu && sponsor;
}

async function fetchBoard(board: string): Promise<GhJob[]> {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    console.warn(`Greenhouse ${board}: ${res.status}`);
    return [];
  }
  const data = (await res.json()) as { jobs?: GhJob[] };
  return data.jobs ?? [];
}

async function main() {
  const target = Number(process.env.DAILY_BATCH_TARGET ?? 25);
  const user = await prisma.user.findFirst({ include: { settings: true } });
  if (!user) throw new Error("Seed the database first");

  const existingUrls = new Set(
    (await prisma.job.findMany({ select: { url: true } })).map((j) => j.url).filter(Boolean),
  );

  let irelandAdded = 0;
  let euAdded = 0;

  for (const board of GREENHOUSE_BOARDS) {
    if (irelandAdded >= target) break;
    const jobs = await fetchBoard(board);
    for (const job of jobs) {
      if (irelandAdded >= target) break;
      if (!TITLE_HINTS.test(job.title)) continue;
      if (SKIP_TITLE.test(job.title)) continue;
      if (existingUrls.has(job.absolute_url)) continue;

      const loc = job.location?.name ?? "";
      const content = (job.content ?? "").replace(/<[^>]+>/g, " ");
      const eu = isEuSponsorshipCandidate(loc, content);
      if (!eu && !isIrelandRelevant(loc, content)) continue;

      const description = `${job.title}\n${board}\n${loc}\n\n${content}`.slice(0, 40000);

      try {
        const saved = await importAndScoreJob({
          description,
          url: job.absolute_url,
          title: job.title,
          company: board.charAt(0).toUpperCase() + board.slice(1),
          source: `greenhouse:${board}`,
          listingCategory: eu ? "eu_sponsorship" : "ireland_core",
        });
        existingUrls.add(job.absolute_url);
        if (eu) {
          euAdded += 1;
          console.log(`EU+  ${saved.score?.totalScore ?? 0}  ${job.title} @ ${board}`);
        } else {
          irelandAdded += 1;
          console.log(`IE   ${saved.score?.totalScore ?? 0}  ${job.title} @ ${board}`);
        }
      } catch (e) {
        console.warn("Skip", job.absolute_url, e instanceof Error ? e.message : e);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        irelandCoreAdded: irelandAdded,
        euSponsorshipAdded: euAdded,
        targetIreland: target,
        note: "EU sponsorship is exclusive and does not count toward the daily 25 Ireland batch.",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
