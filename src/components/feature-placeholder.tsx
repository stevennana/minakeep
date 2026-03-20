type FeaturePlaceholderProps = {
  title: string;
  description: string;
  bullets: string[];
};

export function FeaturePlaceholder({ title, description, bullets }: FeaturePlaceholderProps) {
  return (
    <section className="feature-card">
      <p className="eyebrow">Bootstrap foundation</p>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
      <ul className="bullet-list">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </section>
  );
}
