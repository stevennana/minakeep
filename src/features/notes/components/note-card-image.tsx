import type { NoteCardImage as NoteCardImageData } from "@/features/notes/types";
import { getImageLoadingAttributes, type ImageLoadingIntent } from "@/features/media/loading-intent";

type NoteCardImageProps = {
  frameClassName: string;
  image: NoteCardImageData;
  imageClassName: string;
  loadingIntent?: ImageLoadingIntent;
  testId?: string;
  title: string;
};

export function NoteCardImage({ frameClassName, image, imageClassName, loadingIntent = "lazy", testId, title }: NoteCardImageProps) {
  const alt = image.alt || `Note image for ${title}`;
  const loadingAttributes = getImageLoadingAttributes(loadingIntent);

  return (
    <div className={frameClassName} data-testid={testId}>
      {/* Dynamic note image sources can be owner-only /media URLs or arbitrary markdown URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} className={imageClassName} src={image.src} {...loadingAttributes} />
    </div>
  );
}
