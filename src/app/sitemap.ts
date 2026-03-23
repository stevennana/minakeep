import type { MetadataRoute } from "next";

import { listPublishedContent } from "@/features/public-content/service";
import { buildPublicSitemap } from "@/features/public-site/discovery";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildPublicSitemap(await listPublishedContent());
}
