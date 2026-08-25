/**
 * Turn uploaded resume bytes into plain text for onboarding parse.
 * Supports .txt / .md / plain UTF-8 and PDF via unpdf.
 */

export async function extractTextFromUpload(
  buf: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<{ text: string; mimeType: string } | { error: "pdf_empty" | "unsupported" }> {
  const lower = (fileName || "").toLowerCase();
  const isPdf =
    lower.endsWith(".pdf") ||
    mimeType === "application/pdf" ||
    buf.slice(0, 5).toString("utf8") === "%PDF-";

  if (isPdf) {
    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const result = await extractText(pdf, { mergePages: true });
      const raw = result.text;
      const text = (Array.isArray(raw) ? raw.join("\n") : String(raw ?? ""))
        .replace(/\r\n/g, "\n")
        .trim();
      if (!text) return { error: "pdf_empty" };
      return { text: text.slice(0, 200_000), mimeType: "application/pdf" };
    } catch (err) {
      console.error("[extractTextFromUpload] pdf", err);
      return { error: "pdf_empty" };
    }
  }

  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".markdown") ||
    (mimeType || "").startsWith("text/") ||
    !mimeType
  ) {
    const text = buf.toString("utf8").trim();
    if (!text) return { error: "unsupported" };
    // Reject obvious binary
    if (text.includes("\u0000")) return { error: "unsupported" };
    return {
      text: text.slice(0, 200_000),
      mimeType: mimeType || (lower.endsWith(".md") ? "text/markdown" : "text/plain"),
    };
  }

  return { error: "unsupported" };
}
