"use client";

import { useState } from "react";
import { CAREER_HISTORY_PROMPT } from "@/lib/onboarding/career-history-prompt";

export function CopyCareerPromptButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(CAREER_HISTORY_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="btn-secondary"
    >
      {copied ? "Copied — paste into ChatGPT / Claude" : "Copy prompt sheet for ChatGPT / Claude"}
    </button>
  );
}
