import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      totalScore: true,
      modelVersion: true,
      job: { select: { title: true, company: true, status: true } },
    },
    orderBy: { job: { collectedAt: "desc" } },
    take: 50,
  });

  const llm = scores.filter((s) => s.modelVersion?.startsWith("llm-judge:"));
  const pending = scores.filter((s) => !s.modelVersion?.startsWith("llm-judge:"));

  console.log(
    JSON.stringify(
      {
        total: scores.length,
        llmScored: llm.length,
        pending: pending.length,
        pendingSample: pending.slice(0, 20).map((s) => ({
          id: s.jobId,
          title: s.job.title,
          company: s.job.company,
          mv: s.modelVersion,
          score: s.totalScore,
        })),
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
  .finally(() => prisma.$disconnect());
