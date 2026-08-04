/**
 * Theme tokens — presentation only. Never contain candidate content.
 */

import type { ThemeId } from "../composition/types";

export interface ThemeTypography {
  nameSize: number;
  titleSize: number;
  sectionSize: number;
  roleSize: number;
  companySize: number;
  bodySize: number;
  captionSize: number;
  mutedSize: number;
  fontFamily: string;
  nameWeight: "bold" | "normal";
  roleWeight: "bold" | "normal";
}

export interface ThemeSpacing {
  headerBottom: number;
  sectionBefore: number;
  sectionAfter: number;
  entryGap: number;
  bulletGap: number;
  metadataGap: number;
  dividerGap: number;
  roleGap: number;
  paragraphGap: number;
}

export interface ThemeLayout {
  pageWidthPt: number;
  pageHeightPt: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  /** Fixed date column width (0 = single-column / date above content) */
  dateColumnWidth: number;
  contentColumnGap: number;
  bulletIndent: number;
  useDateColumn: boolean;
  sectionDivider: "rule" | "space" | "none";
  keepEntryTogetherMinHeight: number;
}

export interface ThemeColors {
  ink: string;
  muted: string;
  rule: string;
  link: string;
  accent?: string;
}

export interface Theme {
  id: ThemeId;
  label: string;
  ready: boolean;
  description: string;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  layout: ThemeLayout;
  colors: ThemeColors;
}

const A4: Pick<ThemeLayout, "pageWidthPt" | "pageHeightPt"> = {
  pageWidthPt: 595.28,
  pageHeightPt: 841.89,
};

export const arthurCoxTheme: Theme = {
  id: "arthur-cox",
  label: "Arthur Cox",
  ready: true,
  description: "Editorial consulting/legal layout with date column and generous whitespace.",
  typography: {
    nameSize: 16,
    titleSize: 11,
    sectionSize: 10.5,
    roleSize: 10.5,
    companySize: 9.5,
    bodySize: 9.5,
    captionSize: 8.5,
    mutedSize: 8.5,
    fontFamily: "Helvetica",
    nameWeight: "bold",
    roleWeight: "bold",
  },
  spacing: {
    headerBottom: 14,
    sectionBefore: 16,
    sectionAfter: 8,
    entryGap: 14,
    bulletGap: 3,
    metadataGap: 2,
    dividerGap: 6,
    roleGap: 2,
    paragraphGap: 6,
  },
  layout: {
    ...A4,
    marginTop: 44,
    marginBottom: 44,
    marginLeft: 48,
    marginRight: 48,
    dateColumnWidth: 88,
    contentColumnGap: 14,
    bulletIndent: 12,
    useDateColumn: true,
    sectionDivider: "rule",
    keepEntryTogetherMinHeight: 72,
  },
  colors: {
    ink: "#111111",
    muted: "#555555",
    rule: "#C8C8C8",
    link: "#0B57D0",
  },
};

export const minimalAtsTheme: Theme = {
  id: "minimal-ats",
  label: "Minimal ATS",
  ready: true,
  description: "Single-column dense ATS-safe layout (V3 parity).",
  typography: {
    nameSize: 14,
    titleSize: 11,
    sectionSize: 11,
    roleSize: 10,
    companySize: 9,
    bodySize: 9.5,
    captionSize: 9,
    mutedSize: 9,
    fontFamily: "Helvetica",
    nameWeight: "bold",
    roleWeight: "bold",
  },
  spacing: {
    headerBottom: 10,
    sectionBefore: 12,
    sectionAfter: 6,
    entryGap: 10,
    bulletGap: 2,
    metadataGap: 2,
    dividerGap: 4,
    roleGap: 2,
    paragraphGap: 4,
  },
  layout: {
    ...A4,
    marginTop: 42,
    marginBottom: 42,
    marginLeft: 48,
    marginRight: 48,
    dateColumnWidth: 0,
    contentColumnGap: 0,
    bulletIndent: 10,
    useDateColumn: false,
    sectionDivider: "space",
    keepEntryTogetherMinHeight: 56,
  },
  colors: {
    ink: "#111111",
    muted: "#444444",
    rule: "#DDDDDD",
    link: "#0B57D0",
  },
};

function stub(id: ThemeId, label: string): Theme {
  return {
    ...minimalAtsTheme,
    id,
    label,
    ready: false,
    description: `${label} theme — registry stub (tokens unfinished).`,
  };
}

export const THEME_REGISTRY: Record<ThemeId, Theme> = {
  "arthur-cox": arthurCoxTheme,
  "minimal-ats": minimalAtsTheme,
  stripe: stub("stripe", "Stripe"),
  openai: stub("openai", "OpenAI"),
  google: stub("google", "Google"),
  microsoft: stub("microsoft", "Microsoft"),
  notion: stub("notion", "Notion"),
  startup: stub("startup", "Startup"),
  academic: stub("academic", "Academic"),
  creative: stub("creative", "Creative"),
  executive: stub("executive", "Executive"),
};

export function getTheme(id: ThemeId | string): Theme {
  const theme = THEME_REGISTRY[id as ThemeId];
  if (theme?.ready) return theme;
  if (theme && !theme.ready) return arthurCoxTheme;
  return arthurCoxTheme;
}

export function listReadyThemes(): Theme[] {
  return Object.values(THEME_REGISTRY).filter((t) => t.ready);
}

export function listAllThemes(): Theme[] {
  return Object.values(THEME_REGISTRY);
}
