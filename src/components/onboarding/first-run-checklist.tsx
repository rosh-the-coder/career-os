"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type ChecklistState = {
  profile: boolean;
  markets: boolean;
  eligibility: boolean;
  ai: boolean;
  firstJob: boolean;
  firstResume: boolean;
  firstApp: boolean;
  dismissed?: boolean;
};

export function FirstRunChecklist({
  initial,
  onDismiss,
}: {
  initial: ChecklistState;
  onDismiss: () => Promise<void>;
}) {
  const [open, setOpen] = useState(!initial.dismissed);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!open) return null;

  const items: { key: keyof ChecklistState; label: string; href: string }[] = [
    { key: "profile", label: "Career profile", href: "/onboarding?stage=review" },
    { key: "markets", label: "Markets", href: "/settings" },
    { key: "eligibility", label: "Work eligibility", href: "/settings" },
    { key: "ai", label: "AI provider", href: "/settings" },
    { key: "firstJob", label: "Review a job", href: "/approve" },
    { key: "firstResume", label: "Generate a tailored résumé", href: "/approve" },
    { key: "firstApp", label: "Mark an application", href: "/applications" },
  ];

  return (
    <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-accent">Get started</div>
          <h2 className="mt-1 font-display text-xl text-ink">Your CareerOS checklist</h2>
        </div>
        <button
          type="button"
          disabled={pending}
          className="text-xs text-ink-muted hover:text-ink"
          onClick={() =>
            start(async () => {
              await onDismiss();
              setOpen(false);
              router.refresh();
            })
          }
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => {
          const done = Boolean(initial[item.key]);
          return (
            <li key={item.key} className="flex items-center gap-2">
              <span className={done ? "text-accent" : "text-ink-faint"}>{done ? "✓" : "○"}</span>
              {done ? (
                <span className="text-ink-muted">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-ink hover:text-accent">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
