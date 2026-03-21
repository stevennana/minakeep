import { PublicShowroom, type PublicShowroomItem } from "@/features/public-content/components/public-showroom";
import { listPublishedContent } from "@/features/public-content/service";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

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
      <PublicShowroom hasPublishedLinks={hasPublishedLinks} items={showroomItems} />
    </div>
  );
}
