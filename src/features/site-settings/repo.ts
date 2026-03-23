import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { SITE_SETTINGS_SINGLETON_ID, type PersistedSiteSettings, type SiteBranding } from "@/features/site-settings/types";

const siteSettingsSelect = {
  id: true,
  siteTitle: true,
  siteDescription: true,
  updatedAt: true
};

type SiteSettingsRow = Prisma.SiteSettingsGetPayload<{
  select: typeof siteSettingsSelect;
}>;

function mapSiteSettingsRecord(record: SiteSettingsRow): PersistedSiteSettings {
  return {
    id: record.id,
    siteTitle: record.siteTitle,
    siteDescription: record.siteDescription,
    updatedAt: record.updatedAt
  };
}

export const siteSettingsRepo = {
  async get() {
    const settings = await prisma.siteSettings.findUnique({
      where: {
        id: SITE_SETTINGS_SINGLETON_ID
      },
      select: siteSettingsSelect
    });

    return settings ? mapSiteSettingsRecord(settings) : null;
  },
  async save(branding: SiteBranding) {
    const settings = await prisma.siteSettings.upsert({
      where: {
        id: SITE_SETTINGS_SINGLETON_ID
      },
      update: {
        siteTitle: branding.title,
        siteDescription: branding.description
      },
      create: {
        id: SITE_SETTINGS_SINGLETON_ID,
        siteTitle: branding.title,
        siteDescription: branding.description
      },
      select: siteSettingsSelect
    });

    return mapSiteSettingsRecord(settings);
  }
};
