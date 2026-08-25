/** Neutral Settings create payload for brand-new guests (no Roshan defaults). */
export function neutralSettingsCreate() {
  return {
    location: "Not set",
    currentPermission: "Unknown",
    permissionValidUntil: "",
    permissionRenewableUntil: "",
    canWorkFullTimeNow: true,
    requiresEmploymentPermitNow: false,
    requiresFutureSponsorship: false,
    preferredLongTermPath: "",
    salaryFloorEur: 0,
    salaryFloorSoft: true,
    includeFallbackVideoRoles: false,
    allowedLocationsJson: "[]",
    excludedLocationsJson: "[]",
    preferredEmploymentTypesJson: '["Permanent","Fixed-term"]',
    excludedEmploymentTypesJson: '["Unpaid","Commission only"]',
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    phone: "",
    contactEmail: "",
    instagramUrl: "",
    dailyBatchTarget: 25,
    noticePeriod: "",
    employmentStatus: "exploring",
    layoffDate: "",
    targetRolesText: "",
    marketsJson: "[]",
    primaryMarketLabel: "",
    candidatePositioning: "",
    maxDiscoversPerDay: 3,
  };
}

export function slugifyPersonName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-zA-Z0-9]+/g, ""))
    .filter(Boolean);
  if (!parts.length) return "Candidate";
  return parts.join("_");
}
