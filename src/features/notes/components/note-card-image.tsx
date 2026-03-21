import type { NoteCardImage as NoteCardImageData } from "@/features/notes/types";

type NoteCardImageProps = {
  frameClassName: string;
  image: NoteCardImageData;
  imageClassName: string;
  testId?: string;
  title: string;
};

export function NoteCardImage({ frameClassName, image, imageClassName, testId, title }: NoteCardImageProps) {
  const alt = image.alt || `Note image for ${title}`;

  return (
    <div className={frameClassName} data-testid={testId}>
      {/* Dynamic note image sources can be owner-only /media URLs or arbitrary markdown URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} className={imageClassName} loading="lazy" src={image.src} />
    </div>
  );
}
