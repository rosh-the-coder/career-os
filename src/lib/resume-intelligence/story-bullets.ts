/**
 * Evidence-grounded storytelling bullets for flagship work.
 * Used by intelligence + composers — never invent metrics here.
 */

export const CURATED_PROJECT_BULLETS: Record<
  string,
  { text: string; profiles: string[] }[]
> = {
  aethelgard: [
    {
      text: "Designed a queue-based production pipeline that validated spreadsheet uploads, orchestrated background generation jobs through REST APIs and staged Etsy drafts for human approval.",
      profiles: ["ai_engineer", "applied_ai", "*"],
    },
    {
      text: "Engineered a Factory Dashboard that aggregates application state, review queues and approval gates so no external draft is created without human review.",
      profiles: ["*"],
    },
    {
      text: "Implemented CSV/XLSX batch production with persistent background jobs, daily artwork quotas and dry-run testing to keep high-volume generation controllable.",
      profiles: ["*"],
    },
    {
      text: "Integrated multiple LLM providers and the Etsy Open API in Python behind a local browser interface, keeping publish actions under explicit human control.",
      profiles: ["ai_engineer", "applied_ai", "*"],
    },
  ],
  careeros: [
    {
      text: "Architected a Next.js and TypeScript job OS that imports, parses and scores roles against structured career profiles with evidence-aware CV generation.",
      profiles: ["*"],
    },
    {
      text: "Implemented claim validation, versioning and DOCX/PDF export so resume drafts stay grounded in approved inventory rather than free-form generation.",
      profiles: ["*"],
    },
    {
      text: "Integrated Prisma, Supabase PostgreSQL, Auth and Vercel deployment for a production personal career platform under human review.",
      profiles: ["*"],
    },
  ],
  redvelvetvault: [
    {
      text: "Designed a React and TypeScript product surface for interactive adult entertainment with Firebase-backed auth, content delivery and subscription flows.",
      profiles: ["*"],
    },
    {
      text: "Engineered Unity WebGL integration and state synchronization between the web shell and interactive runtime for a cohesive player experience.",
      profiles: ["design_engineer", "frontend_engineer", "product_engineer", "*"],
    },
    {
      text: "Implemented responsive product UI and content workflows that kept creative assets and interactive scenes under a single publishable product.",
      profiles: ["*"],
    },
  ],
};

export function curatedBulletsForProject(
  projectKey: string,
  profileKey: string,
): { text: string; profiles: string[] }[] {
  const rows = CURATED_PROJECT_BULLETS[projectKey] ?? [];
  return rows.filter((b) => {
    if (!b.profiles.length || b.profiles.includes("*")) return true;
    return b.profiles.includes(profileKey);
  });
}
