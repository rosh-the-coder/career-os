import { prisma } from "@/lib/db/prisma";
import { LLM_PROVIDERS } from "@/lib/byok/catalog";
import { isCaseStudyMode } from "@/lib/case-study/mode";
import { parseJsonArray } from "@/lib/utils";

export type CompletenessSlot = {
  key: string;
  label: string;
  weight: number;
  filled: boolean;
  question?: string;
};

export type CompletenessReport = {
  score: number;
  slots: CompletenessSlot[];
  missing: CompletenessSlot[];
  ready: boolean;
};

const SLOT_DEFS: Omit<CompletenessSlot, "filled">[] = [
  {
    key: "name",
    label: "Full name",
    weight: 10,
    question: "What name should appear on your resumes and in scoring briefs?",
  },
  {
    key: "age",
    label: "Age (18+)",
    weight: 5,
    question: "How old are you? (Must be 18 or older to use CareerOS.)",
  },
  {
    key: "markets",
    label: "Target markets",
    weight: 10,
    question: "Which markets are you targeting? (e.g. Ireland, United States, Canada, India)",
  },
  {
    key: "roles",
    label: "Target roles",
    weight: 10,
    question: "What job titles should Discover prioritize? (comma-separated)",
  },
  {
    key: "permission",
    label: "Work permission",
    weight: 10,
    question: "What work permission or authorization do you have right now?",
  },
  {
    key: "location",
    label: "Home location",
    weight: 5,
    question: "Where are you based? (city / region shown on your CV header)",
  },
  {
    key: "resumes",
    label: "Uploaded resumes (1–5)",
    weight: 20,
    question: "Upload at least one resume (txt/md) so we can seed your inventory.",
  },
  {
    key: "llm_key",
    label: "AI key (Groq / Gemini / OpenAI)",
    weight: 15,
    question: "Add a Groq, Gemini, or OpenAI key so smart scoring and resume suggestions work.",
  },
  {
    key: "contact",
    label: "Contact email",
    weight: 5,
    question: "What email should appear on exported resumes?",
  },
  {
    key: "positioning",
    label: "Career positioning",
    weight: 10,
    question:
      "In one or two sentences, how do you want to be positioned? (e.g. mid-level product designer focused on design systems — not staff/director)",
  },
];

/** Presence-only — never decrypt secrets just to score onboarding. */
export async function hasLlmConfigured(userId: string, isOperator: boolean): Promise<boolean> {
  const count = await prisma.userApiKey.count({
    where: { userId, provider: { in: [...LLM_PROVIDERS] } },
  });
  if (count > 0) return true;
  if (!isOperator && !isCaseStudyMode()) return false;
  return Boolean(
    process.env.GROQ_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim(),
  );
}

export async function computeCompleteness(userId: string): Promise<CompletenessReport> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { settings: true },
  });

  const [resumeCount, hasLlm, answers] = await Promise.all([
    prisma.uploadedResume.count({ where: { userId } }),
    hasLlmConfigured(userId, user.isOperator),
    prisma.onboardingAnswer.findMany({
      where: { userId },
      select: { slotKey: true, answer: true },
    }),
  ]);

  const answerMap = new Map(answers.map((a) => [a.slotKey, a.answer.trim()]));
  const markets = parseJsonArray<string>(user.settings?.marketsJson ?? "[]");
  const hasPermission =
    Boolean(user.settings?.currentPermission?.trim()) &&
    user.settings!.currentPermission !== "Unknown";
  const hasLocation =
    Boolean(user.settings?.location?.trim()) && user.settings!.location !== "Not set";
  const hasContact = Boolean(user.settings?.contactEmail?.trim());
  const hasRoles = Boolean(user.settings?.targetRolesText?.trim()) || Boolean(answerMap.get("roles"));
  const hasPositioning =
    Boolean(user.settings?.candidatePositioning?.trim()) || Boolean(answerMap.get("positioning"));

  const filledByKey: Record<string, boolean> = {
    name: Boolean(user.name?.trim()) && user.name !== "New user",
    age: typeof user.age === "number" && user.age >= 18,
    markets: markets.length > 0 || Boolean(answerMap.get("markets")),
    roles: hasRoles,
    permission: hasPermission || Boolean(answerMap.get("permission")),
    location: hasLocation || Boolean(answerMap.get("location")),
    resumes: resumeCount >= 1,
    llm_key: hasLlm,
    contact: hasContact || Boolean(answerMap.get("contact")),
    positioning: hasPositioning,
  };

  const slots: CompletenessSlot[] = SLOT_DEFS.map((d) => ({
    ...d,
    filled: Boolean(filledByKey[d.key]),
  }));

  const totalWeight = slots.reduce((s, x) => s + x.weight, 0);
  const earned = slots.filter((s) => s.filled).reduce((s, x) => s + x.weight, 0);
  const score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
  const missing = slots.filter((s) => !s.filled);
  const ready =
    filledByKey.name &&
    filledByKey.age &&
    filledByKey.resumes &&
    filledByKey.markets &&
    filledByKey.llm_key &&
    score >= 70;

  return { score, slots, missing, ready };
}

/** Persists score only — never auto-completes onboarding mid-wizard. */
export async function refreshCompleteness(userId: string) {
  const report = await computeCompleteness(userId);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { onboardingStatus: true },
  });
  const nextStatus =
    user.onboardingStatus === "complete"
      ? "complete"
      : user.onboardingStatus === "not_started"
        ? "in_progress"
        : user.onboardingStatus || "in_progress";
  await prisma.user.update({
    where: { id: userId },
    data: {
      completenessScore: report.score,
      onboardingStatus: nextStatus,
    },
  });
  return report;
}

export function nextAdaptiveQuestions(
  report: CompletenessReport,
  limit = 3,
  opts?: { excludeKeys?: string[] },
) {
  const exclude = new Set(opts?.excludeKeys ?? []);
  return report.missing
    .filter((s) => s.question && !exclude.has(s.key))
    .slice(0, limit)
    .map((s, i, arr) => ({
      ...s,
      progressLabel: `${i + 1} of ${arr.length}`,
    }));
}
