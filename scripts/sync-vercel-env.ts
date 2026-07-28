/**
 * Sync local .env keys into Vercel Production + Preview.
 * Requires: vercel login (once), then:
 *   npx tsx --env-file=.env scripts/sync-vercel-env.ts
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "GROQ_SCORE_MODEL",
  "RESUME_DETERMINISTIC_ONLY",
  "ADZUNA_APP_ID",
  "ADZUNA_APP_KEY",
  "ALLOWED_EMAILS",
  "BRAVE_SEARCH_API_KEY",
  "SERPAPI_KEY",
  "GEMINI_SCORE_MODEL",
] as const;

const FORCE = {
  RESUME_DETERMINISTIC_ONLY: "true",
  DEV_BYPASS_AUTH: "false",
  NEXT_PUBLIC_DEV_BYPASS_AUTH: "false",
  GROQ_SCORE_MODEL: process.env.GROQ_SCORE_MODEL || "llama-3.1-8b-instant",
} as const;

function loadDotEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function setEnv(name: string, value: string, env: "production" | "preview") {
  execFileSync("vercel", ["env", "rm", name, env, "--yes"], {
    stdio: ["ignore", "ignore", "ignore"],
  });
  // vercel env add reads value from stdin
  execFileSync("vercel", ["env", "add", name, env, "--force"], {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log(`  set ${name} (${env})`);
}

function main() {
  const file = loadDotEnv(resolve(process.cwd(), ".env"));
  const values: Record<string, string> = { ...FORCE };

  for (const key of KEYS) {
    const fromFile = file[key] ?? process.env[key];
    if (fromFile) values[key] = fromFile;
  }

  const required = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GROQ_API_KEY",
    "RESUME_DETERMINISTIC_ONLY",
    "ADZUNA_APP_ID",
    "ADZUNA_APP_KEY",
  ];
  const missing = required.filter((k) => !values[k]);
  if (missing.length) {
    console.error("Missing required keys:", missing.join(", "));
    process.exit(1);
  }

  console.log("Syncing to Vercel production + preview…");
  for (const env of ["production", "preview"] as const) {
    for (const [name, value] of Object.entries(values)) {
      if (!value) continue;
      try {
        setEnv(name, value, env);
      } catch (err) {
        console.error(`Failed ${name} ${env}:`, err instanceof Error ? err.message : err);
      }
    }
  }
  console.log("Done. Trigger a redeploy if needed: vercel --prod");
}

main();
