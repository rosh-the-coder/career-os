"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/auth/supabase";

/**
 * Supabase sometimes returns auth failures as URL hash fragments on the Site URL.
 * Clear local session and send the user to login with a classified error.
 */
export function AuthHashErrorGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const err = params.get("error") || params.get("error_code");
    if (!err) return;

    const description = (params.get("error_description") || err).replace(/\+/g, " ");
    console.warn("[auth] Hash error:", description);

    const lower = description.toLowerCase();
    const isMagicLink =
      lower.includes("email link") ||
      lower.includes("magic link") ||
      lower.includes("otp") ||
      lower.includes("expired") ||
      err === "otp_expired";

    void (async () => {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut({ scope: "local" });
        }
      } catch {
        /* ignore */
      }
      const url = new URL("/login", window.location.origin);
      url.searchParams.set("error", "auth");
      url.searchParams.set("reason", isMagicLink ? "magic_link" : "oauth_exchange");
      url.searchParams.set("detail", description.slice(0, 160));
      window.location.replace(url.toString());
    })();
  }, []);

  return null;
}
