import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function SearchPage() {
  return (
    <div className="feature-layout">
      <FeaturePlaceholder
        title="Owner search is queued"
        description="The owner-only search screen is deliberately present in the route map, but retrieval behavior waits for its own task instead of bloating bootstrap."
        bullets={[
          "Search remains private to the owner area.",
          "V1 search covers note titles, link titles, URLs, and tags.",
          "Anonymous public search stays out of scope."
        ]}
      />
    </div>
  );
}
