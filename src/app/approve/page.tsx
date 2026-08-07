import { PageHeader, Panel } from "@/components/ui";
import { ApproveQueueClient } from "@/components/approve-queue";
import { prisma } from "@/lib/db/prisma";
import { computeParseConfidence, isLlmScored } from "@/lib/jobs/jd-meta";
import { parseJsonArray } from "@/lib/utils";
import { getPrimaryUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function ApprovePage() {
  const user = await getPrimaryUser();
  const jobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      status: { in: ["scored", "saved", "materials_ready", "new"] },
      NOT: { status: "rejected" },
      score: { isNot: null },
    },
    include: { score: { include: { profile: true } } },
    orderBy: [{ collectedAt: "desc" }],
  });

  const rows = jobs
    .filter((j) => {
      const llm = isLlmScored(j.score?.modelVersion);
      // Unscored (awaiting LLM): always show. LLM-scored: keep meaningful fits.
      if (!llm) return true;
      if ((j.score?.totalScore ?? 0) < 55) return false;
      if (j.yearsRequired != null && j.yearsRequired >= 8) return false;
      if (j.yearsRequired != null && j.yearsRequired >= 6 && /\bsenior\b/i.test(j.title)) return false;
      return true;
    })
    .sort((a, b) => {
      const aLlm = isLlmScored(a.score?.modelVersion) ? 1 : 0;
      const bLlm = isLlmScored(b.score?.modelVersion) ? 1 : 0;
      if (aLlm !== bLlm) return aLlm - bLlm; // unscored first
      return (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0);
    });

  const seen = new Set<string>();
  const deduped = rows.filter((j) => {
    const key = j.url ?? j.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const mapped = deduped.map((j) => {
    const llmScored = isLlmScored(j.score?.modelVersion);
    const reqs = parseJsonArray<{ text: string }>(j.requirementsJson);
    return {
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      listingCategory: j.listingCategory,
      score: j.score?.totalScore ?? 0,
      profileName: j.score?.profile?.name ?? null,
      url: j.url,
      llmScored,
      confidence: computeParseConfidence({
        description: j.descriptionClean || j.descriptionRaw,
        title: j.title,
        location: j.location,
        yearsRequired: j.yearsRequired,
        requirementsCount: reqs.length,
        llmScored,
      }),
    };
  });

  return (
    <div>
      <PageHeader
        title="Approve queue"
        description="Score roles one at a time with the LLM (Click). Then tick ones you want and prepare CV packs."
      />
      <Panel>
        <ApproveQueueClient jobs={mapped} />
      </Panel>
    </div>
  );
}
