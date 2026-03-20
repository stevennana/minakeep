import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function LinksPage() {
  return (
    <div className="feature-layout">
      <FeaturePlaceholder
        title="Private link capture is queued"
        description="The bootstrap foundation creates the route shell and runtime contract, but manual bookmark capture lands as its own feature slice."
        bullets={[
          "Links will remain private in v1.",
          "Each saved link will carry URL, title, summary, and shared tags.",
          "Crawler enrichment and archived snapshots remain out of scope."
        ]}
      />
    </div>
  );
}
