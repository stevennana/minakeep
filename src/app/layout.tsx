import type { Metadata } from "next";
import Link from "next/link";

import { getSiteSettings } from "@/features/site-settings/service";
import { getWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

import "katex/dist/katex.min.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.branding.title,
    description: settings.branding.description
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [workspaceSession, siteSettings] = await Promise.all([getWorkspaceSession(), getSiteSettings()]);
  const workspaceLabel = workspaceSession
    ? isReadOnlyWorkspaceRole(workspaceSession.actor.role)
      ? "Read-only workspace"
      : "Owner workspace"
    : "Owner login";

  return (
    <html lang="en">
      <body className="app-body">
        <div className="page-shell">
          <header className="site-header" data-ui-shell="topbar">
            <div className="brand-block">
              <Link className="brand" href="/">
                {siteSettings.branding.title}
              </Link>
              <p className="brand-caption">{siteSettings.branding.description}</p>
            </div>
            <nav aria-label="Primary" className="site-nav" data-ui-nav="primary">
              <Link href="/">Published notes</Link>
              <Link href={workspaceSession ? "/app" : "/login"}>{workspaceLabel}</Link>
            </nav>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
