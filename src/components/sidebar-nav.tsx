"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/approve", label: "Approve" },
  { href: "/jobs/new", label: "Import" },
  { href: "/profiles", label: "Profiles" },
  { href: "/resume-studio", label: "Resume Studio" },
  { href: "/applications", label: "Applications" },
  { href: "/settings", label: "Settings" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  if (href === "/jobs/new") return pathname === "/jobs/new";
  if (href === "/jobs") {
    return pathname === "/jobs" || (pathname.startsWith("/jobs/") && pathname !== "/jobs/new");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent/15 font-medium text-accent"
                : "text-ink-muted hover:bg-panel-2 hover:text-ink",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal nav for narrow viewports (sidebar is md+ only). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Main">
      {NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors",
              active
                ? "bg-accent/15 font-medium text-accent"
                : "text-ink-muted hover:bg-panel-2 hover:text-ink",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
