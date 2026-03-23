export const SITE_SETTINGS_SINGLETON_ID = "site";

export const SITE_BRANDING_DEFAULTS = Object.freeze({
  title: "Minakeep",
  description: "Private notes and saved references, with selectively public reading."
});

export type SiteBranding = {
  title: string;
  description: string;
};

export type SiteSettings = {
  branding: SiteBranding;
};

export type SiteSettingsInput = {
  title: string | null | undefined;
  description: string | null | undefined;
};

export type PersistedSiteSettings = {
  id: string;
  siteTitle: string;
  siteDescription: string;
  updatedAt: Date;
};

function normalizeField(value: string | null | undefined, fallback: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : fallback;
}

export function normalizeSiteBranding(input: SiteSettingsInput): SiteBranding {
  return {
    title: normalizeField(input.title, SITE_BRANDING_DEFAULTS.title),
    description: normalizeField(input.description, SITE_BRANDING_DEFAULTS.description)
  };
}

export function toSiteSettings(record: PersistedSiteSettings | null): SiteSettings {
  return {
    branding: normalizeSiteBranding({
      title: record?.siteTitle,
      description: record?.siteDescription
    })
  };
}
