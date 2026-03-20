import { FeaturePlaceholder } from "@/components/feature-placeholder";

type PublicNotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicNotePage({ params }: PublicNotePageProps) {
  const { slug } = await params;

  return (
    <div className="feature-layout">
      <FeaturePlaceholder
        title="Published note page is queued"
        description={`The slug "${slug}" resolves to the public-note route shell, but public publishing lands in the next feature slice instead of the bootstrap task.`}
        bullets={[
          "Public note rendering stays queued until the publishing slice lands.",
          "Bootstrap keeps the route honest so smoke tests and operators can see the intended surface.",
          "Once the publishing task lands, this route will render markdown for published notes only."
        ]}
      />
    </div>
  );
}
