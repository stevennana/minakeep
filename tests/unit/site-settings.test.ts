import assert from "node:assert/strict";
import test from "node:test";

import { getSiteSettings, saveSiteSettings, type SiteSettingsRepository } from "../../src/features/site-settings/service";
import { SITE_BRANDING_DEFAULTS } from "../../src/features/site-settings/types";

test("getSiteSettings returns deterministic defaults when no persisted settings exist yet", async () => {
  const repository: SiteSettingsRepository = {
    async get() {
      return null;
    },
    async save() {
      throw new Error("save should not run during a read");
    }
  };

  assert.deepEqual(await getSiteSettings(repository), {
    branding: SITE_BRANDING_DEFAULTS
  });
});

test("getSiteSettings normalizes malformed persisted branding back to safe defaults", async () => {
  const repository: SiteSettingsRepository = {
    async get() {
      return {
        id: "site",
        siteTitle: "   ",
        siteDescription: "",
        updatedAt: new Date("2026-03-23T00:00:00.000Z")
      };
    },
    async save() {
      throw new Error("save should not run during a read");
    }
  };

  assert.deepEqual(await getSiteSettings(repository), {
    branding: SITE_BRANDING_DEFAULTS
  });
});

test("saveSiteSettings trims input and falls back to defaults for blank values before persisting", async () => {
  let savedBranding = null as null | {
    title: string;
    description: string;
  };

  const repository: SiteSettingsRepository = {
    async get() {
      throw new Error("get should not run during a save");
    },
    async save(branding) {
      savedBranding = branding;

      return {
        id: "site",
        siteTitle: branding.title,
        siteDescription: branding.description,
        updatedAt: new Date("2026-03-23T00:00:00.000Z")
      };
    }
  };

  const settings = await saveSiteSettings(
    {
      title: "  ",
      description: "  Updated service description  "
    },
    repository
  );

  assert.deepEqual(savedBranding, {
    title: SITE_BRANDING_DEFAULTS.title,
    description: "Updated service description"
  });
  assert.deepEqual(settings, {
    branding: {
      title: SITE_BRANDING_DEFAULTS.title,
      description: "Updated service description"
    }
  });
});
