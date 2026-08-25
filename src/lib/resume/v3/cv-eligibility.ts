/**
 * Shared CV eligibility: prefer approved+verified inventory, fall back to
 * imported (unapproved) rows so guest onboarding materials still compose.
 * Filters markdown-section junk mistaken for jobs/projects.
 */

import type { CareerInventory, LoadedExperience, LoadedProject } from "./load-career-profile";

const JUNK_SECTION =
  /^(career summary|target roles|roles to avoid|target markets|work eligibility|home location|skills|notes|projects|experience|education)$/i;

export function isJunkExperience(exp: LoadedExperience): boolean {
  const company = exp.company.trim();
  const title = exp.umbrellaTitle.trim();
  if (JUNK_SECTION.test(company) || JUNK_SECTION.test(title)) return true;
  // Parse fragments where company === truncated bullet text
  if (company.length > 0 && company === title && !/[A-Za-z].*[A-Za-z]/.test(company.replace(/\s+/g, ""))) {
    return true;
  }
  if (/^high-demand products$/i.test(company)) return true;
  if (/career inventory/i.test(company) || /career inventory/i.test(title)) return true;
  if (/^---/.test(company) || /^---/.test(title)) return true;
  return false;
}

export function isJunkProject(p: LoadedProject): boolean {
  return JUNK_SECTION.test(p.name.trim()) || /^imported-\d+-projects$/i.test(p.key);
}

export function eligibleExperiences(inventory: CareerInventory): LoadedExperience[] {
  const real = inventory.experiences.filter((e) => !isJunkExperience(e));
  const approved = real.filter((e) => e.approvedForCV && e.verified);
  if (approved.length) return approved;
  // Imported materials are the user's own evidence — use them until Studio approval
  return real.filter((e) => e.bullets.length > 0 || e.resumeBullets.length > 0 || e.umbrellaTitle.length > 2);
}

export function eligibleProjects(inventory: CareerInventory): LoadedProject[] {
  const real = inventory.projects.filter((p) => !isJunkProject(p) && !/academic only/i.test(p.type));
  const approved = real.filter((p) => p.approvedForCV && p.verified);
  if (approved.length) return approved;
  return real.filter((p) => p.resumeBullets.length > 0 || p.outcomes.length > 0 || (p.shortSummary?.length ?? 0) > 0);
}

export function eligibleSkills(inventory: CareerInventory) {
  const approved = inventory.skills.filter((s) => s.approvedForCV && s.verified);
  if (approved.length) return approved;
  return inventory.skills.filter((s) => s.name.trim().length >= 2 && !/^and\b/i.test(s.name.trim()));
}

/** Profile binding: empty / * means usable on any profile including general. */
export function skillMatchesProfile(
  skill: { profiles: string[] },
  profileKey: string,
): boolean {
  if (!skill.profiles.length) return true;
  if (skill.profiles.includes("*")) return true;
  if (profileKey === "general") return true;
  return skill.profiles.includes(profileKey);
}
