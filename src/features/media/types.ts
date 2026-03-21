export const mediaAssetKinds = ["note-image", "link-favicon"] as const;

export type MediaAssetKind = (typeof mediaAssetKinds)[number];

export type MediaAssetAccessRecord = {
  id: string;
  ownerId: string;
  kind: MediaAssetKind;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  note: {
    isPublished: boolean;
    markdown: string;
  } | null;
  link: {
    isPublished: boolean;
  } | null;
};

export type MediaAccessMode = "owner" | "public";

export function getMediaAssetPath(assetId: string) {
  return `/media/${assetId}`;
}

export function isMediaAssetPubliclyVisible(asset: MediaAssetAccessRecord) {
  if (asset.kind === "note-image") {
    return Boolean(asset.note?.isPublished && asset.note.markdown.includes(getMediaAssetPath(asset.id)));
  }

  if (asset.kind === "link-favicon") {
    return Boolean(asset.link?.isPublished);
  }

  return false;
}

export function resolveMediaAssetAccess(asset: MediaAssetAccessRecord, viewerOwnerId: string | null): MediaAccessMode | null {
  if (viewerOwnerId && viewerOwnerId === asset.ownerId) {
    return "owner";
  }

  if (isMediaAssetPubliclyVisible(asset)) {
    return "public";
  }

  return null;
}
