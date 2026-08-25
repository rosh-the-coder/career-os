import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDevAuthBypass() {
  // Never bypass auth in Vercel production, even if env was mis-set.
  if (process.env.VERCEL_ENV === "production") return false;
  return (
    process.env.DEV_BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"
  );
}

/** Comma-separated allowlist; defaults to Roshan's emails */
export function getAllowedEmails(): string[] {
  const raw = process.env.ALLOWED_EMAILS ?? "roshan@theonlyrosh.com,theonlyroshn@gmail.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Operator emails that may share one career profile (aliases for the same person). */
export function getOperatorEmails(): string[] {
  const raw = process.env.OPERATOR_EMAILS ?? process.env.ALLOWED_EMAILS;
  if (raw) {
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["roshan@theonlyrosh.com", "theonlyroshn@gmail.com"];
}

export function isEmailAllowed(email: string | undefined | null): boolean {
  return isEmailAllowedSync(email);
}

/** Sync allowlist only — middleware uses async invite check via isEmailAuthorized. */
export function isEmailAllowedSync(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAllowedEmails().includes(email.toLowerCase());
}
