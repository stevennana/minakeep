import { getMediaAssetPath } from "@/features/media/types";

export const LINK_FAVICON_FALLBACK_PATH = "/icons/link-favicon-fallback.svg";

export function getLinkFaviconPath(faviconAssetId: string | null) {
  return faviconAssetId ? getMediaAssetPath(faviconAssetId) : LINK_FAVICON_FALLBACK_PATH;
}

type LinkFaviconProps = {
  faviconAssetId: string | null;
  frameClassName: string;
  imageClassName: string;
  testId?: string;
};

export function LinkFavicon({ faviconAssetId, frameClassName, imageClassName, testId }: LinkFaviconProps) {
  return (
    <div className={frameClassName} data-favicon-state={faviconAssetId ? "cached" : "fallback"} data-testid={testId}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden="true" className={imageClassName} loading="lazy" src={getLinkFaviconPath(faviconAssetId)} />
    </div>
  );
}
