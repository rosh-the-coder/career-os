/** Case-study mode helpers — isolated demo operator for screenshot capture. */

/** Demo operator email — never the real allowlisted profile. */
export const CASE_STUDY_USER_EMAIL = "case-study@careeros.demo";

export const CASE_STUDY_DEMO_CONTACT = {
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  phone: "+353 000 0000",
  portfolioUrl: "https://example.com/portfolio",
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://www.linkedin.com/in/example",
  contactEmail: "alex.rivera@example.com",
} as const;

export function isCaseStudyMode(): boolean {
  return process.env.CAREEROS_CASE_STUDY_MODE === "true";
}
