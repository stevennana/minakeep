import type { Metadata } from "next";

import { PublicShowroom, type PublicShowroomItem } from "@/features/public-content/components/public-showroom";
import { listPublishedContent } from "@/features/public-content/service";
import { getPublicPageMetadata, PUBLIC_HOME_PATH } from "@/features/public-site/metadata";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function generateMetadata(): Metadata {
  return getPublicPageMetadata(PUBLIC_HOME_PATH);
}

export default async function HomePage() {
  const items = await listPublishedContent();
  const publishedLinks = items.filter((item) => item.kind === "link").length;
  const hasPublishedLinks = publishedLinks > 0;
  const showroomItems: PublicShowroomItem[] = items.map((item) => ({
    ...item,
    publishedAtLabel: publishedDateFormatter.format(item.publishedAt)
  }));

  return (
    <div className="feature-layout public-home-layout" data-testid="public-home-layout">
      <PublicShowroom defaultSearchExpanded={false} hasPublishedLinks={hasPublishedLinks} items={showroomItems} />
    </div>
  );
}
