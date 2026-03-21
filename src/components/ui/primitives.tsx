import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type SurfaceTone = "hero" | "panel" | "card" | "shell" | "inset";

const surfaceToneClasses: Record<SurfaceTone, string> = {
  hero: "hero-card ui-surface ui-surface-hero",
  panel: "panel-card ui-surface ui-surface-panel",
  card: "feature-card ui-surface ui-surface-card",
  shell: "vault-frame ui-surface ui-surface-shell",
  inset: "public-note-metadata ui-surface ui-surface-inset"
};

type SurfaceProps<T extends ElementType> = {
  as?: T;
  tone?: SurfaceTone;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Surface<T extends ElementType = "section">({
  as,
  tone = "panel",
  children,
  className,
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? "section";

  return (
    <Component className={cx(surfaceToneClasses[tone], className)} {...props}>
      {children}
    </Component>
  );
}

type SectionHeadingProps = {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function SectionHeading({ title, meta, className }: SectionHeadingProps) {
  return (
    <div className={cx("section-heading ui-section-heading", className)}>
      <strong>{title}</strong>
      {meta ? <span className="section-meta">{meta}</span> : null}
    </div>
  );
}

type MetadataRowProps = ComponentPropsWithoutRef<"div"> & {
  leading?: boolean;
};

export function MetadataRow({ children, className, leading = false, ...props }: MetadataRowProps) {
  return (
    <div className={cx("note-meta ui-metadata-row", leading && "note-meta-leading", className)} {...props}>
      {children}
    </div>
  );
}

type TagListProps = ComponentPropsWithoutRef<"div">;

export function TagList({ children, className, ...props }: TagListProps) {
  return (
    <div className={cx("tag-list ui-tag-list", className)} {...props}>
      {children}
    </div>
  );
}

type TagChipProps = ComponentPropsWithoutRef<"span"> & {
  muted?: boolean;
};

export function TagChip({ children, className, muted = false, ...props }: TagChipProps) {
  return (
    <span className={cx("tag-pill ui-tag", muted && "tag-pill-muted ui-tag-muted", className)} {...props}>
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={cx(`${variant}-button`, "ui-button", `ui-button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: string;
  variant?: ButtonVariant;
};

export function ButtonLink({ children, className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cx(`${variant}-button`, "ui-button", `ui-button-${variant}`, className)}
      href={href as unknown as ComponentPropsWithoutRef<typeof Link>["href"]}
      {...props}
    >
      {children}
    </Link>
  );
}

type DetailBlockProps = ComponentPropsWithoutRef<"div"> & {
  title: ReactNode;
};

export function DetailBlock({ children, className, title, ...props }: DetailBlockProps) {
  return (
    <div className={cx("detail-block ui-detail-block", className)} {...props}>
      <strong>{title}</strong>
      {children}
    </div>
  );
}
