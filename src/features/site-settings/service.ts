import "server-only";

import { normalizeSiteBranding, toSiteSettings, type PersistedSiteSettings, type SiteBranding, type SiteSettingsInput } from "@/features/site-settings/types";

export type SiteSettingsRepository = {
  get(): Promise<PersistedSiteSettings | null>;
  save(branding: SiteBranding): Promise<PersistedSiteSettings>;
};

async function resolveRepository(repository?: SiteSettingsRepository) {
  if (repository) {
    return repository;
  }

  const { siteSettingsRepo } = await import("@/features/site-settings/repo");
  return siteSettingsRepo;
}

export async function getSiteSettings(repository?: SiteSettingsRepository) {
  return toSiteSettings(await (await resolveRepository(repository)).get());
}

export async function saveSiteSettings(input: SiteSettingsInput, repository?: SiteSettingsRepository) {
  const branding = normalizeSiteBranding(input);
  return toSiteSettings(await (await resolveRepository(repository)).save(branding));
}
