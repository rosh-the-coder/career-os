"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient, isDevAuthBypass, isSupabaseConfigured } from "@/lib/auth/supabase";
import { HeroOperatingModel } from "@/components/marketing/hero-operating-model";
import { Panel } from "@/components/ui";
import { track } from "@/lib/analytics/events";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorDetail = searchParams.get("detail");
  const reason = searchParams.get("reason");
  const bypass = isDevAuthBypass();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "oauth">("idle");
  const [message, setMessage] = useState("");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || bypass) return;
    void (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        setActiveEmail(data.user?.email?.toLowerCase() ?? null);
      } catch {
        setActiveEmail(null);
      }
    })();
  }, [bypass]);

  function redirectTo() {
    const next = searchParams.get("next") ?? "/dashboard";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function clearSession() {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut({ scope: "local" });
    setActiveEmail(null);
  }

  async function signInWithGoogle() {
    setStatus("oauth");
    setMessage("");
    track("login_started", { method: "google" });
    try {
      // Clear any prior session without destroying storage mid-flight oddly —
      // full scope global can race PKCE cookie write on some browsers.
      await clearSession();
      await new Promise((r) => setTimeout(r, 150));
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo(),
          queryParams: { prompt: "select_account", access_type: "online" },
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    track("login_started", { method: "magic_link" });
    try {
      await clearSession();
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo(),
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setStatus("sent");
      setMessage("Check your inbox (and spam) for the CareerOS magic link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send magic link");
    }
  }

  const googleBroken =
    errorCode === "auth" &&
    (reason === "oauth_exchange" || reason === "exchange") &&
    !/email link|magic link|expired/i.test(errorDetail ?? "");
  const magicLinkBad = errorCode === "auth" && reason === "magic_link";

  const errorText =
    errorCode === "unauthorized"
      ? "That account isn’t invited yet. Request access first — you will not see anyone else’s workspace."
      : magicLinkBad
        ? "That magic link was already used or expired. Request a fresh one below — links work once, in one browser."
        : googleBroken
          ? "Google OAuth isn’t completing (Supabase couldn’t exchange Google’s code). Use the magic link below for now, or fix Google Client ID/secret in Supabase."
          : errorCode === "auth"
            ? "Sign-in didn’t complete. Session cleared so you won’t land in another workspace."
            : errorCode === "config"
              ? "Auth isn’t configured."
              : null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-12 md:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 inline-block font-display text-2xl text-ink">
            CareerOS
          </Link>
          <h1 className="font-display text-3xl text-ink md:text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Invite-only beta. Each invited account gets an isolated workspace.
          </p>

          {activeEmail ? (
            <Panel className="mt-6 border-accent/30">
              <p className="text-sm text-ink">
                Currently signed in as <span className="font-medium text-accent">{activeEmail}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href="/dashboard" className="text-accent hover:underline">
                  Continue to dashboard →
                </Link>
                <button
                  type="button"
                  className="text-ink-muted hover:text-ink"
                  onClick={() => void clearSession()}
                >
                  Sign out to switch accounts
                </button>
              </div>
            </Panel>
          ) : null}

          {bypass ? (
            <Panel className="mt-6 border-warn/30">
              <p className="text-sm text-ink-muted">
                <span className="text-warn">Dev auth bypass is on.</span> Local only — production
                ignores this.
              </p>
            </Panel>
          ) : null}

          {errorText ? (
            <Panel className="mt-6 border-danger/40">
              <p className="text-sm text-danger">{errorText}</p>
              {errorDetail ? (
                <p className="mt-2 font-mono text-[11px] text-ink-faint">{errorDetail}</p>
              ) : null}
            </Panel>
          ) : null}

          {googleBroken ? (
            <Panel className="mt-4 border-accent/30">
              <p className="text-sm text-ink">
                <span className="font-medium text-accent">Workaround:</span> use magic link below.
                Invited guests get an isolated workspace + onboarding.
              </p>
            </Panel>
          ) : null}

          {magicLinkBad ? (
            <Panel className="mt-4 border-accent/30">
              <p className="text-sm text-ink">
                Enter your email and click <span className="text-accent">Email magic link</span> again.
                Open the newest email once — don&apos;t reuse an old link in Incognito.
              </p>
            </Panel>
          ) : null}

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={status === "oauth" || status === "loading"}
              className="w-full rounded-md border border-line bg-panel-2 px-5 py-3 text-sm font-medium text-ink hover:border-accent/40 disabled:opacity-60"
            >
              {status === "oauth" ? "Redirecting…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <div className="h-px flex-1 bg-line" />
              {googleBroken ? "use magic link instead" : "or email magic link"}
              <div className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={sendMagicLink} className="space-y-3">
              <label className="block text-sm">
                <span className="text-ink-muted">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2.5"
                />
              </label>
              <button
                type="submit"
                disabled={status === "loading" || status === "oauth"}
                className="w-full rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-canvas disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Email magic link"}
              </button>
              {message ? (
                <p className={`text-sm ${status === "error" ? "text-danger" : "text-ink-muted"}`}>
                  {message}
                </p>
              ) : null}
            </form>

            <p className="text-center text-sm text-ink-muted">
              Need an invite?{" "}
              <Link href="/request-access" className="text-accent hover:underline">
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-center bg-panel/40 px-10 py-12 lg:flex">
        <div className="w-full max-w-lg">
          <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Job → Score → CV
          </p>
          <HeroOperatingModel />
        </div>
      </div>
    </div>
  );
}
