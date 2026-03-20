import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function TagsPage() {
  return (
    <div className="feature-layout">
      <FeaturePlaceholder
        title="Shared tags are queued"
        description="The route shape for shared tags is present, but tag browsing and filtering remain a later vertical slice."
        bullets={[
          "Tags will be shared between notes and links.",
          "Public readers do not get a tags interface in v1.",
          "The retrieval slice will add counts and filtering behavior."
        ]}
      />
    </div>
  );
}
