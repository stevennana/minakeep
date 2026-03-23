import type { MetadataRoute } from "next";

import { getPublicRobots } from "@/features/public-site/discovery";

export default function robots(): MetadataRoute.Robots {
  return getPublicRobots();
}
