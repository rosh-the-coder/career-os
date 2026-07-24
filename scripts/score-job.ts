#!/usr/bin/env tsx
import { scoreExistingJob } from "../src/lib/jobs/service";

async function main() {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf("--job-id");
  const jobId = idIdx >= 0 ? args[idIdx + 1] : args[0];
  if (!jobId) {
    console.error("Usage: npm run cli:score -- --job-id <id>");
    process.exit(1);
  }
  const job = await scoreExistingJob(jobId);
  console.log(JSON.stringify({
    id: job.id,
    status: job.status,
    score: job.score?.totalScore,
    profile: job.score?.profile?.name,
    strengths: job.score?.strengthsJson,
    gaps: job.score?.gapsJson,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
