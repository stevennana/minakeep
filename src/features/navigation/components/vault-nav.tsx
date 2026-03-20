"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Notes" },
  { href: "/app/links", label: "Links" },
  { href: "/app/tags", label: "Tags" },
  { href: "/app/search", label: "Search" }
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app" || pathname.startsWith("/app/notes");
  }

  return pathname.startsWith(href);
}

export function VaultNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Private vault sections" className="vault-nav">
      {navItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "vault-nav-link vault-nav-link-active" : "vault-nav-link"}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
