/**
 * Score pending (non-LLM) jobs one at a time with pacing for Groq free TPM/RPM.
 * Usage: npx tsx --env-file=.env scripts/score-pending.ts
 */
import { PrismaClient } from "@prisma/client";
import { scoreExistingJob } from "../src/lib/jobs/service";
import { isLlmScored, countWords, JD_WORD_SOFT_LIMIT } from "../src/lib/jobs/jd-meta";

const prisma = new PrismaClient();
const DELAY_MS = Number(process.env.SCORE_DELAY_MS ?? 4000);
const LIMIT = Number(process.env.SCORE_LIMIT ?? 20);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const scores = await prisma.jobScore.findMany({
    where: {
      job: {
        status: { in: ["scored", "saved", "materials_ready", "new"] },
        NOT: { status: "rejected" },
      },
    },
    select: {
      jobId: true,
      modelVersion: true,
      job: {
        select: {
          title: true,
          company: true,
          descriptionClean: true,
          descriptionRaw: true,
        },
      },
    },
    orderBy: { job: { collectedAt: "desc" } },
  });

  const pending = scores.filter((s) => !isLlmScored(s.modelVersion)).slice(0, LIMIT);
  console.log(`Pending LLM score: ${pending.length} (delay ${DELAY_MS}ms)`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY missing in process env");
  }

  let okCount = 0;
  for (let i = 0; i < pending.length; i++) {
    const row = pending[i]!;
    const desc = row.job.descriptionClean || row.job.descriptionRaw || "";
    const words = countWords(desc);
    console.log(
      `\n[${i + 1}/${pending.length}] ${row.job.title} @ ${row.job.company} (${words}w${words > JD_WORD_SOFT_LIMIT ? " OVER" : ""})`,
    );

    try {
      const job = await scoreExistingJob(row.jobId);
      const mv = job.score?.modelVersion ?? null;
      const total = job.score?.totalScore ?? null;
      const ok = isLlmScored(mv);
      if (ok) okCount += 1;
      console.log(`  → ${ok ? "LLM" : "fallback"} ${mv} score=${total}`);
      if (!ok) {
        const flags = job.softFlagsJson ?? "[]";
        console.log(`  softFlags: ${flags.slice(0, 280)}`);
      }
    } catch (err) {
      console.error(`  → ERROR`, err instanceof Error ? err.message : err);
    }

    if (i < pending.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. LLM scored ${okCount}/${pending.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
