/** API key providers users can bring (BYOK). */

export type ApiKeyProvider =
  | "groq"
  | "gemini"
  | "openai"
  | "adzuna_app_id"
  | "adzuna_app_key"
  | "brave"
  | "serpapi";

export type KeyImportance = "required_any_llm" | "recommended" | "optional";

export type KeyCatalogEntry = {
  provider: ApiKeyProvider;
  label: string;
  importance: KeyImportance;
  badge: string;
  tooltip: string;
  procureUrl?: string;
  procureLabel?: string;
};

export const KEY_CATALOG: KeyCatalogEntry[] = [
  {
    provider: "groq",
    label: "Groq",
    importance: "required_any_llm",
    badge: "Free AI path",
    tooltip:
      "Powers job fit scores and resume suggestions on a free key from console.groq.com. Great for trying CareerOS at $0 — free tier can throttle you (that “wait ~1 min” thing). If you already have Gemini or OpenAI, paste that instead and skip Groq.",
    procureUrl: "https://console.groq.com/keys",
    procureLabel: "Get a Groq key",
  },
  {
    provider: "gemini",
    label: "Google Gemini",
    importance: "required_any_llm",
    badge: "Skip the Groq wait",
    tooltip:
      "Same scoring and suggestions as Groq, but on your own Gemini key — usually no free-tier 1-minute stalls. Paste it if you already use Google AI Studio. You only need one LLM key total.",
    procureUrl: "https://aistudio.google.com/apikey",
    procureLabel: "Google AI Studio",
  },
  {
    provider: "openai",
    label: "OpenAI",
    importance: "required_any_llm",
    badge: "Skip the Groq wait",
    tooltip:
      "Same jobs as Groq/Gemini: scoring and resume suggestions. Use your OpenAI key if that’s what you already pay for. CareerOS prefers OpenAI/Gemini over Groq when both exist so you’re not stuck behind Groq limits.",
    procureUrl: "https://platform.openai.com/api-keys",
    procureLabel: "OpenAI API keys",
  },
  {
    provider: "adzuna_app_id",
    label: "Adzuna App ID",
    importance: "recommended",
    badge: "Recommended",
    tooltip:
      "Pulls extra job ads from Adzuna’s index on top of company career boards. Free developer keys at developer.adzuna.com — you’ll get both an app id and an app key. Skip it and you’ll still get Greenhouse/Lever/Ashby-style listings — just fewer aggregations.",
    procureUrl: "https://developer.adzuna.com/",
    procureLabel: "Adzuna developer",
  },
  {
    provider: "adzuna_app_key",
    label: "Adzuna App Key",
    importance: "recommended",
    badge: "Recommended",
    tooltip:
      "Pairs with Adzuna App ID. Same free developer account. Without both, Discover still runs on public boards only for your account.",
    procureUrl: "https://developer.adzuna.com/",
    procureLabel: "Adzuna developer",
  },
  {
    provider: "brave",
    label: "Brave Search",
    importance: "optional",
    badge: "Optional",
    tooltip:
      "After a job is imported, optionally checks whether search engines also show it on LinkedIn, Indeed, or Glassdoor — a soft heads-up, not a hard filter. Free Brave Search API key. Skip unless you care about that signal.",
    procureUrl: "https://brave.com/search/api/",
    procureLabel: "Brave Search API",
  },
  {
    provider: "serpapi",
    label: "SerpAPI",
    importance: "optional",
    badge: "Optional",
    tooltip:
      "Same board-presence idea as Brave, different search API. Free plan is only ~250 searches/month — easy to burn if you Discover often. Prefer Brave, or skip; CareerOS works fine without either.",
    procureUrl: "https://serpapi.com/",
    procureLabel: "SerpAPI",
  },
];

export const LLM_PROVIDERS: ApiKeyProvider[] = ["openai", "gemini", "groq"];
