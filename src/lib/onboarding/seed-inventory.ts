import { prisma } from "@/lib/db/prisma";
import type { ParsedCareerHistory } from "@/lib/onboarding/parse-history-md";
import type { ParsedResume } from "@/lib/onboarding/parse-resume-text";

/** Seed draft inventory from parsed resume / career-history markdown. Never invents facts. */
export async function seedInventoryFromParsed(
  userId: string,
  parsed: ParsedCareerHistory,
  opts?: {
    softSettings?: boolean;
    contactEmail?: string;
    location?: string;
    headline?: string;
    existing?: {
      candidatePositioning?: string | null;
      targetRolesText?: string | null;
      contactEmail?: string | null;
      location?: string | null;
    };
  },
) {
  const profiles = await prisma.careerProfile.count({ where: { userId } });
  if (!profiles) {
    await prisma.careerProfile.create({
      data: {
        userId,
        key: "general",
        name: "General",
        positioning:
          opts?.existing?.candidatePositioning ||
          opts?.headline ||
          "Open to relevant mid-level roles",
        keywordsJson: "[]",
        evidenceOrderJson: "[]",
        isDefault: true,
      },
    });
  }

  for (const skill of parsed.skills.slice(0, 40)) {
    await prisma.skill.upsert({
      where: { userId_name: { userId, name: skill.slice(0, 80) } },
      create: {
        userId,
        name: skill.slice(0, 80),
        category: "imported",
        keywordsJson: "[]",
        profilesJson: JSON.stringify(["*"]),
        verified: true,
        approvedForCV: true,
      },
      update: {
        verified: true,
        approvedForCV: true,
        profilesJson: JSON.stringify(["*"]),
      },
    });
  }

  for (const exp of parsed.experiences.slice(0, 12)) {
    const company = exp.company.slice(0, 120);
    const title = exp.title.slice(0, 120);
    // Skip markdown section headers mistaken for jobs
    if (/^(career summary|target roles|roles to avoid|target markets|work eligibility|home location|skills|notes|projects|experience)$/i.test(title)) {
      continue;
    }
    if (/^(career summary|target roles|roles to avoid|target markets|work eligibility|home location)$/i.test(company)) {
      continue;
    }
    if (/career inventory/i.test(company) || /career inventory/i.test(title)) {
      continue;
    }
    const existing = await prisma.experience.findFirst({
      where: { userId, company, umbrellaTitle: title },
      select: { id: true },
    });
    if (existing) {
      await prisma.experience.update({
        where: { id: existing.id },
        data: {
          verified: true,
          approvedForCV: true,
          bulletsJson: JSON.stringify(exp.bullets.slice(0, 12)),
          resumeBulletsJson: JSON.stringify(
            exp.bullets.slice(0, 12).map((text) => ({ text, profiles: ["*"] })),
          ),
        },
      });
      continue;
    }
    await prisma.experience.create({
      data: {
        userId,
        company,
        umbrellaTitle: title,
        startDate: "Unknown",
        themesJson: "[]",
        bulletsJson: JSON.stringify(exp.bullets.slice(0, 12)),
        resumeBulletsJson: JSON.stringify(
          exp.bullets.slice(0, 12).map((text) => ({ text, profiles: ["*"] })),
        ),
        verified: true,
        approvedForCV: true,
      },
    });
  }

  for (const [i, proj] of parsed.projects.slice(0, 10).entries()) {
    const key = `imported-${i}-${proj.name.slice(0, 40).replace(/\W+/g, "-").toLowerCase() || "project"}`;
    await prisma.project.upsert({
      where: { userId_key: { userId, key } },
      create: {
        userId,
        key,
        name: proj.name.slice(0, 120),
        type: "imported",
        status: "draft",
        primaryRole: "Contributor",
        stackJson: "[]",
        featuresJson: "[]",
        outcomesJson: JSON.stringify(proj.bullets.slice(0, 8)),
        useAsEvidenceForJson: "[]",
        resumeBulletsJson: JSON.stringify(
          proj.bullets.slice(0, 8).map((text) => ({ text, profiles: ["*"] })),
        ),
        verified: true,
        approvedForCV: true,
      },
      update: {
        outcomesJson: JSON.stringify(proj.bullets.slice(0, 8)),
        resumeBulletsJson: JSON.stringify(
          proj.bullets.slice(0, 8).map((text) => ({ text, profiles: ["*"] })),
        ),
        verified: true,
        approvedForCV: true,
      },
    });
  }

  if (!opts?.softSettings) return;

  const seed: Record<string, string> = {};
  const existing = opts.existing ?? {};
  const summaryNote = parsed.notes.find((n) => n.trim().length > 20);
  if (summaryNote && !existing.candidatePositioning?.trim()) {
    seed.candidatePositioning = summaryNote.slice(0, 500);
  } else if (opts.headline && !existing.candidatePositioning?.trim()) {
    seed.candidatePositioning = opts.headline.slice(0, 500);
  }
  if (opts.contactEmail && !existing.contactEmail?.trim()) {
    seed.contactEmail = opts.contactEmail.slice(0, 200);
  }
  if (
    opts.location &&
    (!existing.location?.trim() || existing.location === "Not set")
  ) {
    seed.location = opts.location.slice(0, 120);
  }
  // Soft-seed target roles from headline if empty
  if (opts.headline && !existing.targetRolesText?.trim()) {
    seed.targetRolesText = opts.headline.slice(0, 120);
  }

  if (Object.keys(seed).length) {
    await prisma.settings.update({ where: { userId }, data: seed });
  }
}

export async function seedFromParsedResume(userId: string, parsed: ParsedResume, existing?: {
  candidatePositioning?: string | null;
  targetRolesText?: string | null;
  contactEmail?: string | null;
  location?: string | null;
}) {
  await seedInventoryFromParsed(userId, parsed, {
    softSettings: true,
    contactEmail: parsed.contactEmail,
    location: parsed.location,
    headline: parsed.headline,
    existing,
  });
}
