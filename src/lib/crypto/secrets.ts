import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function encryptionKey(): Buffer {
  const raw =
    process.env.USER_SECRETS_KEY?.trim() ||
    process.env.ENCRYPTION_SECRET?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    "careeros-dev-secrets-key-change-me";
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string): { ciphertext: string; iv: string; tag: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSecret(payload: { ciphertext: string; iv: string; tag: string }): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function lastFour(plain: string): string {
  const t = plain.trim();
  if (t.length <= 4) return t;
  return t.slice(-4);
}
