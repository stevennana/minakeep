import { PublicShowroom, type PublicShowroomItem } from "@/features/public-content/components/public-showroom";
import { listPublishedContent } from "@/features/public-content/service";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const SAFE_PUBLIC_LINK_PROTOCOLS = new Set(["http:", "https:"]);

function isSafePublicLinkUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return SAFE_PUBLIC_LINK_PROTOCOLS.has(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const items = await listPublishedContent();
  const safeItems = items.filter((item) => item.kind !== "link" || isSafePublicLinkUrl(item.url));
  const publishedLinks = safeItems.filter((item) => item.kind === "link").length;
  const hasPublishedLinks = publishedLinks > 0;
  const showroomItems: PublicShowroomItem[] = safeItems.map((item) => ({
    ...item,
    publishedAtLabel: publishedDateFormatter.format(item.publishedAt)
  }));

  return (
    <div className="feature-layout public-home-layout" data-testid="public-home-layout">
      <PublicShowroom hasPublishedLinks={hasPublishedLinks} items={showroomItems} />
    </div>
  );
}
