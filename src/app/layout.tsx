import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Minakeep",
  description: "Private notes and links, with selectively published public notes and links."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header className="site-header">
            <div className="brand-block">
              <Link className="brand" href="/">
                Minakeep
              </Link>
              <p className="brand-caption">Private notes and saved references, with selectively public reading.</p>
            </div>
            <nav aria-label="Primary" className="site-nav">
              <Link href="/">Published notes</Link>
              <Link href="/login">Owner login</Link>
            </nav>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
