import { saveSiteSettingsAction } from "@/app/app/settings/actions";
import { Button, Disclosure, FormField, IntroBlock, MetadataRow, SectionHeading, Surface } from "@/components/ui/primitives";
import { getSiteSettings } from "@/features/site-settings/service";
import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

type SettingsPageProps = {
  searchParams?: Promise<{
    saved?: string;
    error?: string;
  }>;
};

function getStatusMessage(error?: string) {
  if (error === "read-only") {
    return "Read-only demo users cannot save workspace settings.";
  }

  return undefined;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [workspace, siteSettings, resolvedSearchParams] = await Promise.all([
    requireWorkspaceSession(),
    getSiteSettings(),
    searchParams
  ]);
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);
  const formSurfaceProps = isReadOnly ? ({ as: "div" as const }) : ({ action: saveSiteSettingsAction, as: "form" as const });
  const statusMessage =
    resolvedSearchParams?.saved === "1"
      ? "Site settings saved."
      : getStatusMessage(resolvedSearchParams?.error);

  return (
    <div className="feature-layout">
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description="Shared title and description for the public and private shells."
          eyebrow={isReadOnly ? "Read-only demo" : "Workspace settings"}
          title="Site configuration"
        >
          <MetadataRow aria-label="Settings overview" className="secondary-route-meta" leading>
            <span>General settings</span>
            <span>Shared branding</span>
            <span>{isReadOnly ? "Read-only" : "Owner editable"}</span>
          </MetadataRow>
        </IntroBlock>
        {statusMessage ? (
          <p className={resolvedSearchParams?.error ? "status-note status-note-error" : "status-note"}>{statusMessage}</p>
        ) : null}
        {isReadOnly ? (
          <p className="read-only-note">This route stays visible in the demo workspace, but site-setting changes remain disabled.</p>
        ) : null}
      </Surface>

      <Surface {...formSurfaceProps} className="secondary-control-panel" density="compact" tone="panel">
        <SectionHeading meta="Shared shell branding" title="General" />
        <div className="owner-links-capture-fields">
          <FormField hint="Used in the public header, private shell, and browser metadata." label="Site title">
            <input
              autoComplete="organization"
              className="text-input"
              defaultValue={siteSettings.branding.title}
              disabled={isReadOnly}
              name="title"
              required
              type="text"
            />
          </FormField>
          <FormField hint="Used as the shared service description when no other route copy replaces it." label="Site description">
            <textarea
              className="text-input"
              defaultValue={siteSettings.branding.description}
              disabled={isReadOnly}
              name="description"
              required
              rows={4}
            />
          </FormField>
          <div className="button-row owner-links-capture-actions">
            <Button disabled={isReadOnly} type="submit">
              {isReadOnly ? "Save unavailable" : "Save settings"}
            </Button>
          </div>
        </div>
        <Disclosure summary="Configuration boundary">
          <p>This route is the durable home for broader site-wide configuration. This wave stores only title and description.</p>
        </Disclosure>
      </Surface>
    </div>
  );
}
