import type { MetadataRoute } from "next";

import { listPublishedContent } from "@/features/public-content/service";
import { buildPublicSitemap } from "@/features/public-site/discovery";
import { getPublicHomepageLastChangedAt } from "@/features/public-site/state";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedContent, homepageLastChangedAt] = await Promise.all([listPublishedContent(), getPublicHomepageLastChangedAt()]);

  return buildPublicSitemap(publishedContent, homepageLastChangedAt);
}
