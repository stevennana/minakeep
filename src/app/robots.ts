import type { MetadataRoute } from "next";

import { getPublicRobots } from "@/features/public-site/discovery";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return getPublicRobots();
}
