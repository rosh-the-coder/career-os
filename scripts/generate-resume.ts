/**
 * CLI: generate a resume for a job id (V3 by default via RESUME_ENGINE_VERSION).
 * Usage: npx tsx scripts/generate-resume.ts <jobId> [1|2]
 */
import { generateResumeForJob } from "../src/lib/resume/service";

async function main() {
  const jobId = process.argv[2];
  const pages = (process.argv[3] === "2" ? 2 : 1) as 1 | 2;
  if (!jobId) {
    console.error("Usage: npx tsx scripts/generate-resume.ts <jobId> [1|2]");
    process.exit(1);
  }
  process.env.RESUME_ENGINE_VERSION = process.env.RESUME_ENGINE_VERSION ?? "v3";
  const version = await generateResumeForJob(jobId, pages);
  console.log(
    JSON.stringify(
      {
        id: version.id,
        fileName: version.fileName,
        profileId: version.profileId,
        pageLength: version.pageLength,
        validationStatus: version.validationStatus,
        composerVersion: version.composerVersion,
        schemaVersion: version.schemaVersion,
        docxPath: version.docxPath,
        pdfPath: version.pdfPath,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
