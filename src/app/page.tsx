import type { Metadata } from "next";

import { PublicShowroom, type PublicShowroomItem } from "@/features/public-content/components/public-showroom";
import { listPublishedContentPage } from "@/features/public-content/service";
import { getPublicPageMetadata, PUBLIC_HOME_PATH } from "@/features/public-site/metadata";
import { normalizeIncrementalLimit, PUBLIC_COLLECTION_PAGE_SIZE } from "@/lib/pagination";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function generateMetadata(): Metadata {
  return getPublicPageMetadata(PUBLIC_HOME_PATH);
}

type HomePageProps = {
  searchParams?: Promise<{
    limit?: string;
    q?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = resolvedSearchParams.q?.trim() ?? "";
  const limit = normalizeIncrementalLimit(resolvedSearchParams.limit, PUBLIC_COLLECTION_PAGE_SIZE);
  const { archiveCount, hasPublishedLinks, items, matchingCount } = await listPublishedContentPage({
    limit,
    query
  });
  const showroomItems: PublicShowroomItem[] = items.map((item) => ({
    ...item,
    publishedAtLabel: publishedDateFormatter.format(item.publishedAt)
  }));

  return (
    <div className="feature-layout public-home-layout" data-testid="public-home-layout">
      <PublicShowroom
        archiveCount={archiveCount}
        defaultSearchExpanded={false}
        hasPublishedLinks={hasPublishedLinks}
        initialLimit={limit}
        items={showroomItems}
        key={`public-showroom-${query || "all"}`}
        matchingCount={matchingCount}
        query={query}
      />
    </div>
  );
}
