const RESEND_API = "https://api.resend.com/emails";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "CareerOS <onboarding@resend.dev>";
}

export function operatorNotifyEmail(): string | null {
  const raw = process.env.OPERATOR_NOTIFY_EMAIL ?? process.env.OPERATOR_EMAILS ?? "";
  const first = raw
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  return first ?? null;
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[email:skipped]", input.subject, "→", input.to);
    return { ok: true, skipped: true };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? input.text.replace(/\n/g, "<br/>"),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[email:failed]", res.status, body);
    return { ok: false, error: body || res.statusText };
  }

  return { ok: true };
}
