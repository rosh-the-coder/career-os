import { prisma } from "@/lib/db/prisma";
import { decryptSecret, encryptSecret, lastFour } from "@/lib/crypto/secrets";
import {
  KEY_CATALOG,
  LLM_PROVIDERS,
  type ApiKeyProvider,
} from "@/lib/byok/catalog";
import { isCaseStudyMode } from "@/lib/case-study/mode";

export type ResolvedKeys = {
  groq?: string;
  gemini?: string;
  openai?: string;
  adzunaAppId?: string;
  adzunaAppKey?: string;
  brave?: string;
  serpapi?: string;
  /** Prefer paid/higher-limit first when present. */
  preferredLlm: "openai" | "gemini" | "groq" | "none";
  hasAnyLlm: boolean;
  hasAdzuna: boolean;
};

function isProvider(p: string): p is ApiKeyProvider {
  return KEY_CATALOG.some((k) => k.provider === p);
}

/** Operator (isOperator / case-study / env fallback) may use process.env when no BYOK row. */
export async function resolveUserKeys(userId: string, opts?: { isOperator?: boolean }): Promise<ResolvedKeys> {
  const rows = await prisma.userApiKey.findMany({ where: { userId } });
  const map = new Map<string, string>();
  for (const row of rows) {
    try {
      map.set(row.provider, decryptSecret({ ciphertext: row.ciphertext, iv: row.iv, tag: row.tag }));
    } catch {
      /* skip corrupt */
    }
  }

  const allowEnv = Boolean(opts?.isOperator) || isCaseStudyMode();

  const groq = map.get("groq") || (allowEnv ? process.env.GROQ_API_KEY?.trim() : undefined);
  const gemini = map.get("gemini") || (allowEnv ? process.env.GEMINI_API_KEY?.trim() : undefined);
  const openai = map.get("openai") || (allowEnv ? process.env.OPENAI_API_KEY?.trim() : undefined);
  const adzunaAppId =
    map.get("adzuna_app_id") || (allowEnv ? process.env.ADZUNA_APP_ID?.trim() : undefined);
  const adzunaAppKey =
    map.get("adzuna_app_key") || (allowEnv ? process.env.ADZUNA_APP_KEY?.trim() : undefined);
  const brave =
    map.get("brave") || (allowEnv ? process.env.BRAVE_SEARCH_API_KEY?.trim() : undefined);
  const serpapi =
    map.get("serpapi") || (allowEnv ? process.env.SERPAPI_KEY?.trim() : undefined);

  let preferredLlm: ResolvedKeys["preferredLlm"] = "none";
  if (openai) preferredLlm = "openai";
  else if (gemini) preferredLlm = "gemini";
  else if (groq) preferredLlm = "groq";

  return {
    groq: groq || undefined,
    gemini: gemini || undefined,
    openai: openai || undefined,
    adzunaAppId: adzunaAppId || undefined,
    adzunaAppKey: adzunaAppKey || undefined,
    brave: brave || undefined,
    serpapi: serpapi || undefined,
    preferredLlm,
    hasAnyLlm: Boolean(openai || gemini || groq),
    hasAdzuna: Boolean(adzunaAppId && adzunaAppKey),
  };
}

export async function listUserKeyMeta(userId: string) {
  const rows = await prisma.userApiKey.findMany({ where: { userId } });
  return KEY_CATALOG.map((entry) => {
    const row = rows.find((r) => r.provider === entry.provider);
    return {
      ...entry,
      configured: Boolean(row),
      lastFour: row?.lastFour ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

export async function upsertUserApiKey(userId: string, provider: string, plain: string) {
  if (!isProvider(provider)) throw new Error("Unknown provider");
  const value = plain.trim();
  if (!value) throw new Error("Key cannot be empty");
  const enc = encryptSecret(value);
  await prisma.userApiKey.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      tag: enc.tag,
      lastFour: lastFour(value),
    },
    update: {
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      tag: enc.tag,
      lastFour: lastFour(value),
    },
  });
}

export async function deleteUserApiKey(userId: string, provider: string) {
  if (!isProvider(provider)) throw new Error("Unknown provider");
  await prisma.userApiKey.deleteMany({ where: { userId, provider } });
}

export function userHasLlmKey(keys: ResolvedKeys): boolean {
  return keys.hasAnyLlm || LLM_PROVIDERS.some((p) => Boolean(keys[p as keyof ResolvedKeys]));
}
