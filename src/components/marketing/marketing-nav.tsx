"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how-it-works", label: "Product" },
  { href: "/#operating-model", label: "How it works" },
  { href: "/#principles", label: "Principles" },
] as const;

export function MarketingNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        solid ? "border-b border-line bg-canvas/95 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          CareerOS
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex" aria-label="Marketing">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/request-access"
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent/40"
          >
            Request access
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-canvas hover:bg-accent-dim"
          >
            Sign in
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/login" className="text-sm text-accent">
            Sign in
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-md border border-line px-2 py-1.5 text-sm"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-canvas px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-ink-muted hover:text-ink" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Link href="/request-access" className="text-ink" onClick={() => setOpen(false)}>
              Request access
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
