/** Notion-style application tracker vocab + helpers */

export const STATUS_TAGS = [
  { id: "Applied", color: "blue" },
  { id: "Interviewed", color: "tan" },
  { id: "Rejected", color: "red" },
  { id: "Offer", color: "purple" },
  { id: "Accepted", color: "green" },
] as const;

export const NEXT_ACTION_TAGS = [
  { id: "Follow up", color: "green" },
  { id: "Waiting", color: "tan" },
  { id: "Prepare Interview", color: "blue" },
  { id: "Send email", color: "pink" },
  { id: "Decide", color: "purple" },
] as const;

export type TagColor = "blue" | "tan" | "red" | "purple" | "green" | "pink" | "gray";

export const TAG_PILL_CLASS: Record<TagColor, string> = {
  blue: "bg-[#3b6ea5]/80 text-white",
  tan: "bg-[#9a7b4f]/90 text-white",
  red: "bg-[#a14a45]/90 text-white",
  purple: "bg-[#6b5b95]/90 text-white",
  green: "bg-[#3d7a57]/90 text-white",
  pink: "bg-[#9a4f72]/90 text-white",
  gray: "bg-panel-2 text-ink-muted",
};

export function colorForStatus(tag: string): TagColor {
  const found = STATUS_TAGS.find((t) => t.id.toLowerCase() === tag.toLowerCase());
  return (found?.color as TagColor) ?? "gray";
}

export function colorForNextAction(tag: string): TagColor {
  const found = NEXT_ACTION_TAGS.find((t) => t.id.toLowerCase() === tag.toLowerCase());
  return (found?.color as TagColor) ?? "gray";
}

/** Map legacy status string → Notion status tags */
export function legacyStatusToTags(status: string): string[] {
  const s = status.toLowerCase();
  if (s.includes("offer")) return ["Offer"];
  if (s.includes("interview")) return ["Applied", "Interviewed"];
  if (s.includes("reject")) return ["Applied", "Rejected"];
  if (s.includes("withdraw")) return ["Rejected"];
  if (s === "applied" || s.includes("recruiter")) return ["Applied"];
  return ["Applied"];
}

/** Primary status tag → legacy status field for compatibility */
export function primaryTagToStatus(tags: string[]): string {
  const set = new Set(tags.map((t) => t.toLowerCase()));
  if (set.has("accepted")) return "offer";
  if (set.has("offer")) return "offer";
  if (set.has("rejected") && !set.has("interviewed")) return "rejected_after_application";
  if (set.has("interviewed")) return "interview";
  if (set.has("applied")) return "applied";
  return "applied";
}

export function parseSalaryNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[€$£,\s]/g, "");
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*[kK]?/);
  if (!m) return null;
  let n = Number(m[1]);
  if (/k/i.test(raw) && n < 1000) n *= 1000;
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function formatSalaryDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const n = parseSalaryNumber(raw);
  if (n == null) return raw;
  return `€${n.toLocaleString("en-IE")}`;
}

export function formatDateLong(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function monthsBetween(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.round((ms / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;
}

export type TrackerRow = {
  id: string;
  jobId: string | null;
  company: string;
  position: string;
  statusTags: string[];
  applicationDate: string | null; // ISO date yyyy-mm-dd
  salaryAsked: string | null;
  nextActions: string[];
  website: string | null;
  contact: string | null;
  referenceLink: string | null;
  location: string | null;
  workSetting: string | null;
  notes: string | null;
  resumeFileName: string | null;
  resumeVersionId: string | null;
  sortOrder: number;
  jobUrl: string | null;
};
