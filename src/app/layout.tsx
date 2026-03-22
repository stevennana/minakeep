import type { Metadata } from "next";
import Link from "next/link";

import { getOwnerSession } from "@/lib/auth/owner-session";

import "./globals.css";

export const metadata: Metadata = {
  title: "Minakeep",
  description: "Private notes and links, with selectively published public notes and links."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ownerSession = await getOwnerSession();

  return (
    <html lang="en">
      <body className="app-body">
        <div className="page-shell">
          <header className="site-header" data-ui-shell="topbar">
            <div className="brand-block">
              <Link className="brand" href="/">
                Minakeep
              </Link>
              <p className="brand-caption">Private notes and saved references, with selectively public reading.</p>
            </div>
            <nav aria-label="Primary" className="site-nav" data-ui-nav="primary">
              <Link href="/">Published notes</Link>
              <Link href={ownerSession ? "/app" : "/login"}>{ownerSession ? "Owner workspace" : "Owner login"}</Link>
            </nav>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
