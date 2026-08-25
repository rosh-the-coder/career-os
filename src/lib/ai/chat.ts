import type { ResolvedKeys } from "@/lib/byok/keys";

export type LlmChatProvider = "openai" | "gemini" | "groq";

export type LlmChatResult = {
  text: string;
  model: string;
  provider: LlmChatProvider;
};

/**
 * Call chat completion with BYOK-aware routing:
 * OpenAI → Gemini → Groq (prefer higher-limit keys first).
 */
export async function chatJsonCompletion(
  prompt: string,
  keys: ResolvedKeys,
  opts?: { system?: string },
): Promise<LlmChatResult | null> {
  const system =
    opts?.system ??
    "You are a rigorous career assistant. Reply with JSON only. Never invent candidate experience.";

  const order: LlmChatProvider[] = [];
  if (keys.openai) order.push("openai");
  if (keys.gemini) order.push("gemini");
  if (keys.groq) order.push("groq");
  // If preferred is set, put it first uniquely
  if (keys.preferredLlm !== "none") {
    const rest = order.filter((p) => p !== keys.preferredLlm);
    order.length = 0;
    order.push(keys.preferredLlm, ...rest);
  }

  const errors: string[] = [];
  for (const provider of order) {
    try {
      if (provider === "openai" && keys.openai) {
        return await callOpenAi(prompt, keys.openai, system);
      }
      if (provider === "gemini" && keys.gemini) {
        return await callGemini(prompt, keys.gemini);
      }
      if (provider === "groq" && keys.groq) {
        return await callGroq(prompt, keys.groq, system);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  if (errors.length) {
    const err = new Error(errors.join(" | "));
    (err as Error & { llmErrors: string[] }).llmErrors = errors;
    throw err;
  }
  return null;
}

async function callOpenAi(
  prompt: string,
  key: string,
  system: string,
): Promise<LlmChatResult> {
  const model = process.env.OPENAI_SCORE_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI empty response");
  return { text, model, provider: "openai" };
}

async function callGroq(prompt: string, key: string, system: string): Promise<LlmChatResult> {
  const model = process.env.GROQ_SCORE_MODEL?.trim() || "openai/gpt-oss-20b";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq empty response");
  return { text, model, provider: "groq" };
}

async function callGemini(prompt: string, key: string): Promise<LlmChatResult> {
  const model = process.env.GEMINI_SCORE_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini empty response");
  return { text, model, provider: "gemini" };
}
