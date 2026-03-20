import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Minakeep",
  description: "Private notes and links, with selectively published public notes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header className="site-header">
            <Link className="brand" href="/">
              Minakeep
            </Link>
            <nav className="site-nav">
              <Link href="/">Published notes</Link>
              <Link href="/login">Owner login</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
