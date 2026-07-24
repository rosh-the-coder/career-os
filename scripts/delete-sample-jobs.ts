import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, company: true, source: true },
  });
  console.log("Jobs before:", JSON.stringify(jobs, null, 2));

  // Remove demo/sample imports only (no URL, or known sample titles)
  const sample = await prisma.job.findMany({
    where: {
      OR: [
        { title: { contains: "UX Engineer" }, company: { contains: "Unknown" } },
        { title: { contains: "UX Engineer" }, company: { contains: "Dublin Product" } },
        { source: "cli" },
        { descriptionRaw: { contains: "Dublin Product Studio" } },
      ],
    },
  });

  for (const job of sample) {
    await prisma.resumeVersion.deleteMany({ where: { jobId: job.id } });
    await prisma.application.deleteMany({ where: { jobId: job.id } });
    await prisma.jobScore.deleteMany({ where: { jobId: job.id } });
    await prisma.job.delete({ where: { id: job.id } });
    console.log("Deleted sample job:", job.id, job.title, job.company);
  }

  if (sample.length === 0) {
    console.log("No sample jobs matched; listing all for manual check");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
