import { getMediaAssetPath } from "@/features/media/types";
import { getImageLoadingAttributes, type ImageLoadingIntent } from "@/features/media/loading-intent";

export const LINK_FAVICON_FALLBACK_PATH = "/icons/link-favicon-fallback.svg";

export function getLinkFaviconPath(faviconAssetId: string | null) {
  return faviconAssetId ? getMediaAssetPath(faviconAssetId) : LINK_FAVICON_FALLBACK_PATH;
}

type LinkFaviconProps = {
  faviconAssetId: string | null;
  frameClassName: string;
  imageClassName: string;
  loadingIntent?: ImageLoadingIntent;
  testId?: string;
};

export function LinkFavicon({ faviconAssetId, frameClassName, imageClassName, loadingIntent = "lazy", testId }: LinkFaviconProps) {
  const loadingAttributes = getImageLoadingAttributes(loadingIntent);

  return (
    <div className={frameClassName} data-favicon-state={faviconAssetId ? "cached" : "fallback"} data-testid={testId}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden="true" className={imageClassName} src={getLinkFaviconPath(faviconAssetId)} {...loadingAttributes} />
    </div>
  );
}
