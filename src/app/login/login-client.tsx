"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient, isDevAuthBypass } from "@/lib/auth/supabase";
import { PageHeader, Panel } from "@/components/ui";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const bypass = isDevAuthBypass();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env first.");
      }
      const supabase = createSupabaseBrowserClient();
      const next = searchParams.get("next") ?? "/dashboard";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setStatus("sent");
      setMessage("Check your email for the magic link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send magic link");
    }
  }

  const errorText =
    errorCode === "unauthorized"
      ? "That email is not allowlisted for CareerOS."
      : errorCode === "auth"
        ? "Sign-in failed. Try again."
        : errorCode === "config"
          ? "Supabase is not configured."
          : null;

  return (
    <div>
      <PageHeader
        title="Sign in"
        description="Magic link via Supabase Auth. Only allowlisted emails can access CareerOS."
      />

      {bypass ? (
        <Panel className="mb-4 border-warn/30">
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-warn">DEV_BYPASS_AUTH is on.</span> Routes are open
            without login. Turn it off for Vercel production.
          </p>
        </Panel>
      ) : null}

      {errorText ? (
        <Panel className="mb-4 border-danger/40">
          <p className="text-sm text-danger">{errorText}</p>
        </Panel>
      ) : null}

      <Panel>
        <form onSubmit={sendMagicLink} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-ink-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="theonlyroshn@gmail.com"
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-ink outline-none focus:border-accent/50"
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Email magic link"}
          </button>
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-danger" : "text-ink-muted"}`}>{message}</p>
          ) : null}
        </form>
      </Panel>
    </div>
  );
}
