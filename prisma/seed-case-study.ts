/**
 * Case-study capture seed — isolated demo operator.
 *
 * Does NOT modify the real allowlisted user inventory.
 * Upserts user: case-study@careeros.demo
 *
 * Usage: npm run seed:case-study
 */
import { PrismaClient } from "@prisma/client";
import {
  CASE_STUDY_DEMO_CONTACT,
  CASE_STUDY_USER_EMAIL,
} from "../src/lib/case-study/mode";

const prisma = new PrismaClient();

const DEMO_TAG = "[CASE_STUDY_DEMO]";

async function main() {
  console.log(`${DEMO_TAG} Seeding isolated case-study operator…`);

  const user = await prisma.user.upsert({
    where: { email: CASE_STUDY_USER_EMAIL },
    create: {
      email: CASE_STUDY_USER_EMAIL,
      name: CASE_STUDY_DEMO_CONTACT.name,
      settings: {
        create: {
          contactEmail: CASE_STUDY_DEMO_CONTACT.contactEmail,
          phone: CASE_STUDY_DEMO_CONTACT.phone,
          portfolioUrl: CASE_STUDY_DEMO_CONTACT.portfolioUrl,
          githubUrl: CASE_STUDY_DEMO_CONTACT.githubUrl,
          linkedinUrl: CASE_STUDY_DEMO_CONTACT.linkedinUrl,
          salaryFloorEur: 40000,
          salaryFloorSoft: true,
          includeFallbackVideoRoles: false,
          dailyBatchTarget: 25,
          currentPermission: "Stamp 1G",
          permissionValidUntil: "2027-09",
          permissionRenewableUntil: "2028-09",
          employmentStatus: "between_roles",
          layoffDate: "2026-07-17",
          noticePeriod: "Immediate",
        },
      },
    },
    update: {
      name: CASE_STUDY_DEMO_CONTACT.name,
      settings: {
        update: {
          contactEmail: CASE_STUDY_DEMO_CONTACT.contactEmail,
          phone: CASE_STUDY_DEMO_CONTACT.phone,
          portfolioUrl: CASE_STUDY_DEMO_CONTACT.portfolioUrl,
          githubUrl: CASE_STUDY_DEMO_CONTACT.githubUrl,
          linkedinUrl: CASE_STUDY_DEMO_CONTACT.linkedinUrl,
        },
      },
    },
    include: { settings: true },
  });

  // Wipe only this user's jobs / applications / resume versions for determinism
  await prisma.application.deleteMany({ where: { userId: user.id } });
  await prisma.resumeVersion.deleteMany({ where: { userId: user.id } });
  await prisma.jobScore.deleteMany({
    where: { job: { userId: user.id } },
  });
  await prisma.job.deleteMany({ where: { userId: user.id } });

  // Minimal profiles for recommendation UI (safe copy — not real contact inventory rewrite)
  const existingProfiles = await prisma.careerProfile.count({ where: { userId: user.id } });
  if (existingProfiles === 0) {
    await prisma.careerProfile.createMany({
      data: [
        {
          userId: user.id,
          key: "ux_engineer",
          name: "UX Engineer",
          positioning: "Demo positioning for case-study capture",
          keywordsJson: JSON.stringify(["UX", "React", "Design Systems"]),
          evidenceOrderJson: "[]",
          isDefault: true,
        },
        {
          userId: user.id,
          key: "ai_engineer",
          name: "AI Engineer",
          positioning: "Demo AI Engineer positioning",
          keywordsJson: JSON.stringify(["AI", "Automation", "TypeScript"]),
          evidenceOrderJson: "[]",
          isDefault: false,
        },
        {
          userId: user.id,
          key: "product_engineer",
          name: "Product Engineer",
          positioning: "Demo Product Engineer positioning",
          keywordsJson: JSON.stringify(["Product", "Full-stack", "Next.js"]),
          evidenceOrderJson: "[]",
          isDefault: false,
        },
      ],
    });
  }

  const uxProfile = await prisma.careerProfile.findFirst({
    where: { userId: user.id, key: "ux_engineer" },
  });
  const aiProfile = await prisma.careerProfile.findFirst({
    where: { userId: user.id, key: "ai_engineer" },
  });

  // Stable demo jobs
  const scored = await prisma.job.create({
    data: {
      userId: user.id,
      source: "case_study_seed",
      sourceJobId: "cs-scored-001",
      url: "https://example.com/jobs/ux-engineer-dublin",
      company: "North Harbor Labs",
      title: "UX Engineer",
      location: "Dublin, Ireland",
      country: "Ireland",
      remoteType: "hybrid",
      employmentType: "Permanent",
      descriptionRaw:
        "UX Engineer role building design systems and product UI in Dublin. React, TypeScript, accessibility.",
      descriptionClean:
        "UX Engineer role building design systems and product UI in Dublin. React, TypeScript, accessibility.",
      seniority: "mid",
      yearsRequired: 3,
      sponsorshipText: "Visa sponsorship not available",
      softFlagsJson: JSON.stringify([
        {
          code: "no_sponsorship_language",
          message: "No sponsorship language — keep for Stamp 1G review",
          severity: "soft",
        },
      ]),
      status: "scored",
      listingCategory: "ireland_core",
      keywordsJson: JSON.stringify(["React", "TypeScript", "Design Systems", "UX"]),
      requirementsJson: JSON.stringify([
        { text: "React and TypeScript", preferred: false },
        { text: "Design systems experience", preferred: false },
      ]),
      responsibilitiesJson: JSON.stringify(["Ship UI", "Partner with design"]),
    },
  });

  const scoreBase = {
    eligibilityCurrent: "eligible_now",
    eligibilityFuture: "unknown",
    recommendedProjectsJson: JSON.stringify(["Workflow OS", "Demo Systems Work"]),
    evidenceUsedJson: JSON.stringify(["demo-evidence"]),
  };

  await prisma.jobScore.create({
    data: {
      jobId: scored.id,
      profileId: uxProfile!.id,
      totalScore: 78,
      skillsOverlap: 0.82,
      evidenceStrength: 0.74,
      projectRelevance: 0.8,
      seniorityFit: 0.85,
      currentEligibility: 0.9,
      longTermPermit: 0.55,
      locationFit: 0.95,
      salaryFit: 0.7,
      careerAlignment: 0.88,
      strengthsJson: JSON.stringify([
        "Strong React / TypeScript overlap",
        "Dublin hybrid location fit",
      ]),
      gapsJson: JSON.stringify(["Sponsorship language soft-flagged for review"]),
      explanationJson: JSON.stringify({
        summary: "Solid mid-level UX Engineer fit for Dublin hybrid.",
        modelNote: "case-study deterministic demo scores",
      }),
      modelVersion: "deterministic-v1",
      ...scoreBase,
      recommendedProjectsJson: JSON.stringify(["Demo Systems Work", "Workflow OS"]),
    },
  });

  const materials = await prisma.job.create({
    data: {
      userId: user.id,
      source: "case_study_seed",
      sourceJobId: "cs-materials-001",
      url: "https://example.com/jobs/ai-engineer-dublin",
      company: "Cedarline Systems",
      title: "AI Engineer",
      location: "Dublin, Ireland",
      country: "Ireland",
      remoteType: "hybrid",
      employmentType: "Permanent",
      descriptionRaw:
        "AI Engineer building internal automation and LLM-assisted workflows. TypeScript, APIs, evaluation.",
      descriptionClean:
        "AI Engineer building internal automation and LLM-assisted workflows. TypeScript, APIs, evaluation.",
      seniority: "mid",
      yearsRequired: 4,
      softFlagsJson: "[]",
      status: "materials_ready",
      listingCategory: "ireland_core",
      keywordsJson: JSON.stringify(["AI", "TypeScript", "Automation", "APIs"]),
      requirementsJson: JSON.stringify([{ text: "Production TypeScript", preferred: false }]),
      responsibilitiesJson: JSON.stringify(["Build AI-assisted internal tools"]),
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: materials.id,
      profileId: aiProfile!.id,
      totalScore: 84,
      skillsOverlap: 0.86,
      evidenceStrength: 0.8,
      projectRelevance: 0.88,
      seniorityFit: 0.8,
      currentEligibility: 0.92,
      longTermPermit: 0.6,
      locationFit: 0.95,
      salaryFit: 0.75,
      careerAlignment: 0.9,
      strengthsJson: JSON.stringify(["Applied AI automation alignment", "Strong project relevance"]),
      gapsJson: JSON.stringify(["Deep ML research not required — good"]),
      explanationJson: JSON.stringify({
        summary: "High fit for applied AI engineering path.",
      }),
      modelVersion: "llm-judge:demo-fallback",
      ...scoreBase,
      recommendedProjectsJson: JSON.stringify(["Workflow OS"]),
    },
  });

  const rejected = await prisma.job.create({
    data: {
      userId: user.id,
      source: "case_study_seed",
      sourceJobId: "cs-rejected-001",
      url: "https://example.com/jobs/principal-design-engineer",
      company: "Atlas Motion Works",
      title: "Principal Design Engineer",
      location: "Dublin, Ireland",
      country: "Ireland",
      remoteType: "onsite",
      employmentType: "Permanent",
      descriptionRaw:
        "Principal Design Engineer — mechanical CAD, SolidWorks, physical product design. 10+ years required.",
      descriptionClean:
        "Principal Design Engineer — mechanical CAD, SolidWorks, physical product design. 10+ years required.",
      seniority: "principal",
      yearsRequired: 10,
      status: "rejected",
      hardRejectReason: "Seniority / discipline hard reject (principal + mechanical CAD)",
      softFlagsJson: JSON.stringify([
        {
          code: "high_years_requested",
          message: "High years requested",
          severity: "soft",
        },
      ]),
      listingCategory: "ireland_core",
      keywordsJson: JSON.stringify(["CAD", "SolidWorks", "Mechanical"]),
      requirementsJson: "[]",
      responsibilitiesJson: "[]",
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: rejected.id,
      totalScore: 18,
      skillsOverlap: 0.1,
      evidenceStrength: 0.2,
      projectRelevance: 0.15,
      seniorityFit: 0.05,
      currentEligibility: 0.4,
      longTermPermit: 0.4,
      locationFit: 0.9,
      salaryFit: 0.5,
      careerAlignment: 0.1,
      strengthsJson: "[]",
      gapsJson: JSON.stringify(["Mechanical CAD out of band", "Principal seniority hard reject"]),
      explanationJson: JSON.stringify({ summary: "Hard-rejected before soft scoring mattered." }),
      modelVersion: "deterministic-v1",
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
      recommendedProjectsJson: "[]",
      evidenceUsedJson: "[]",
    },
  });

  const fallback = await prisma.job.create({
    data: {
      userId: user.id,
      source: "case_study_seed",
      sourceJobId: "cs-fallback-001",
      url: "https://example.com/jobs/product-engineer",
      company: "Harborfield",
      title: "Product Engineer",
      location: "Dublin, Ireland",
      country: "Ireland",
      remoteType: "remote",
      employmentType: "Permanent",
      descriptionRaw: "Product Engineer — Next.js, product sense, shipping velocity.",
      descriptionClean: "Product Engineer — Next.js, product sense, shipping velocity.",
      seniority: "mid",
      yearsRequired: 3,
      softFlagsJson: JSON.stringify([
        {
          code: "llm_rate_limit",
          message: "LLM rate limited — heuristic fallback used. Trim the job description if retrying.",
          severity: "soft",
        },
      ]),
      status: "scored",
      listingCategory: "ireland_core",
      keywordsJson: JSON.stringify(["Next.js", "Product", "TypeScript"]),
      requirementsJson: "[]",
      responsibilitiesJson: "[]",
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: fallback.id,
      profileId: uxProfile!.id,
      totalScore: 71,
      skillsOverlap: 0.7,
      evidenceStrength: 0.65,
      projectRelevance: 0.72,
      seniorityFit: 0.8,
      currentEligibility: 0.9,
      longTermPermit: 0.55,
      locationFit: 0.85,
      salaryFit: 0.7,
      careerAlignment: 0.75,
      strengthsJson: JSON.stringify(["Product engineering overlap"]),
      gapsJson: JSON.stringify(["LLM judge unavailable — heuristic fallback used"]),
      explanationJson: JSON.stringify({
        summary: "Heuristic score after provider rate limit.",
        softFlag: "llm_rate_limit",
      }),
      modelVersion: "deterministic-v1",
      ...scoreBase,
    },
  });

  if (!aiProfile) throw new Error("AI profile missing for case-study user");

  // Parent + child resume versions for lineage screenshot
  const parentResume = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      jobId: materials.id,
      profileId: aiProfile.id,
      fileName: "Alex_Rivera_AI_Engineer_Cedarline_demo",
      contentJson: JSON.stringify({
        schemaVersion: "3.0",
        demo: true,
        contact: CASE_STUDY_DEMO_CONTACT,
        summary: "Demo resume content for case-study capture. Not a real submission artifact.",
        selectedProjects: ["Demo Systems Work", "Workflow OS"],
      }),
      markdown: `# Alex Rivera — AI Engineer\n\nDemo resume for portfolio capture.\n\n${CASE_STUDY_DEMO_CONTACT.email} · ${CASE_STUDY_DEMO_CONTACT.phone}\n`,
      evidenceUsedJson: JSON.stringify(["demo-evidence"]),
      validationStatus: "warning",
      validationJson: JSON.stringify({
        status: "warning",
        warnings: ["Demo corpus: metric needs review flag on one claim"],
        blocked: [],
      }),
      composerVersion: "resume-engine-v3.0.0",
      schemaVersion: "3.0",
      themeId: "arthur-cox",
      optimizeJson: JSON.stringify({
        coverage: 0.72,
        missing: ["evaluation harness", "observability"],
        notes: "Demo ATS keyword analysis",
      }),
    },
  });

  await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      jobId: materials.id,
      profileId: aiProfile.id,
      parentVersionId: parentResume.id,
      fileName: "Alex_Rivera_AI_Engineer_Cedarline_demo_ats",
      contentJson: parentResume.contentJson,
      markdown: parentResume.markdown + "\n\n_ATS keyword pass (demo)._\n",
      evidenceUsedJson: JSON.stringify(["demo-evidence"]),
      validationStatus: "passed",
      validationJson: JSON.stringify({ status: "passed", warnings: [], blocked: [] }),
      composerVersion: "resume-engine-v4.0.0",
      schemaVersion: "4.0",
      themeId: "arthur-cox",
      compositionJson: JSON.stringify({ demo: true, blocks: ["header", "summary", "experience", "projects"] }),
      critiqueJson: JSON.stringify({ total: 78, notes: ["Demo critic scores"] }),
      optimizeJson: JSON.stringify({ coverage: 0.86, missing: [], parent: parentResume.id }),
    },
  });

  await prisma.application.createMany({
    data: [
      {
        userId: user.id,
        jobId: materials.id,
        resumeVersionId: parentResume.id,
        companyName: "Cedarline Systems",
        positionTitle: "AI Engineer",
        status: "applied",
        statusTagsJson: JSON.stringify(["Applied"]),
        nextActionsJson: JSON.stringify(["Follow up"]),
        locationApplied: "Dublin",
        workSetting: "Hybrid",
        website: "https://example.com",
        notes: null,
        recruiterName: null,
        recruiterEmail: null,
        sortOrder: 0,
      },
      {
        userId: user.id,
        companyName: "North Harbor Labs",
        positionTitle: "UX Engineer",
        status: "applied",
        statusTagsJson: JSON.stringify(["Applied", "Interviewed"]),
        nextActionsJson: JSON.stringify(["Prepare Interview"]),
        locationApplied: "Dublin",
        workSetting: "Hybrid",
        notes: null,
        recruiterName: null,
        recruiterEmail: null,
        sortOrder: 1,
      },
    ],
  });

  // Minimal project rows for profiles / recommendation panels if UI reads them
  const projectCount = await prisma.project.count({ where: { userId: user.id } });
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          userId: user.id,
          key: "workflow_os",
          name: "Workflow OS",
          type: "product",
          status: "active",
          primaryRole: "AI Engineer",
          shortSummary: "Demo project — evidence-grounded job-search operating system.",
          stackJson: JSON.stringify(["Next.js", "Prisma", "TypeScript"]),
          featuresJson: JSON.stringify(["Hard filters", "Resume validation"]),
          outcomesJson: JSON.stringify(["Deterministic filters", "Claim-validated resumes"]),
          useAsEvidenceForJson: JSON.stringify(["ai_engineer", "ux_engineer"]),
          resumeBulletsJson: JSON.stringify([
            "Built evidence-first resume composition with validation gates",
          ]),
          approvedForCV: true,
          cvPriority: 1,
          featured: true,
        },
        {
          userId: user.id,
          key: "demo_systems",
          name: "Demo Systems Work",
          type: "product",
          status: "active",
          primaryRole: "UX Engineer",
          shortSummary: "Demo design-engineering project for capture states.",
          stackJson: JSON.stringify(["React", "Design Systems"]),
          featuresJson: JSON.stringify(["Component library"]),
          outcomesJson: JSON.stringify(["Accessible UI primitives"]),
          useAsEvidenceForJson: JSON.stringify(["ux_engineer", "design_engineer"]),
          resumeBulletsJson: JSON.stringify(["Shipped accessible UI primitives"]),
          approvedForCV: true,
          cvPriority: 2,
          featured: true,
        },
      ],
    });
  }

  console.log(`${DEMO_TAG} Ready.`);
  console.log(`${DEMO_TAG} User: ${user.email} (${user.id})`);
  console.log(`${DEMO_TAG} Jobs: scored=${scored.id} materials=${materials.id} rejected=${rejected.id} fallback=${fallback.id}`);
  console.log(`${DEMO_TAG} Set CAREEROS_CASE_STUDY_MODE=true and restart npm run dev`);
  console.log(`${DEMO_TAG} Real user inventory was not modified.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
