#!/usr/bin/env tsx
import { readFileSync } from "fs";
import { importAndScoreJob } from "../src/lib/jobs/service";

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const urlIdx = args.indexOf("--url");
  const titleIdx = args.indexOf("--title");
  const companyIdx = args.indexOf("--company");

  const file =
    (fileIdx >= 0 ? args[fileIdx + 1] : undefined) ??
    args.find((a) => !a.startsWith("--") && a.endsWith(".txt"));
  const url = urlIdx >= 0 ? args[urlIdx + 1] : undefined;
  const title = titleIdx >= 0 ? args[titleIdx + 1] : undefined;
  const company = companyIdx >= 0 ? args[companyIdx + 1] : undefined;

  const description = file ? readFileSync(file, "utf8") : undefined;
  if (!description && !url) {
    console.error("Usage: npm run cli:import -- --file job.txt [--url URL] [--title T] [--company C]");
    process.exit(1);
  }

  const job = await importAndScoreJob({ description, url, title, company, source: "cli" });
  console.log(JSON.stringify({
    id: job.id,
    title: job.title,
    company: job.company,
    status: job.status,
    score: job.score?.totalScore,
    profile: job.score?.profile?.name,
    hardRejectReason: job.hardRejectReason,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
