import { PageHeader, Panel } from "@/components/ui";
import { ApproveQueueClient } from "@/components/approve-queue";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ApprovePage() {
  const jobs = await prisma.job.findMany({
    where: {
      status: { in: ["scored", "saved", "materials_ready"] },
      score: { isNot: null },
    },
    include: { score: { include: { profile: true } } },
    orderBy: [{ collectedAt: "desc" }],
  });

  const rows = jobs
    .filter((j) => (j.score?.totalScore ?? 0) >= 60)
    .sort((a, b) => (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0))
    .map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      status: j.status,
      listingCategory: j.listingCategory,
      score: j.score?.totalScore ?? 0,
      profileName: j.score?.profile?.name ?? null,
      url: j.url,
    }));

  return (
    <div>
      <PageHeader
        title="Approve queue"
        description="Select roles you want to chase. CareerOS prepares CV packs — you open the listing and submit."
      />
      <Panel>
        <ApproveQueueClient jobs={rows} />
      </Panel>
    </div>
  );
}
