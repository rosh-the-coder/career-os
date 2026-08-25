"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "btn-primary",
  "primary-sm": "btn-primary-sm",
  secondary: "btn-secondary",
  ghost: "text-sm text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline",
} as const;

export function SubmitButton({
  children,
  className,
  pendingLabel = "Saving…",
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  variant?: keyof typeof VARIANTS;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(VARIANTS[variant], className)}
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
