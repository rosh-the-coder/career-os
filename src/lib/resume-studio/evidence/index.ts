/**
 * Evidence Engine façade — wraps V3 inventory + claim validation.
 */

export {
  loadCareerInventory,
  buildEvidenceCorpus,
  type CareerInventory,
} from "@/lib/resume/v3/load-career-profile";

export {
  validateResumeContentV3,
  legacyValidationFromV3,
} from "@/lib/resume/v3/validate-content";
