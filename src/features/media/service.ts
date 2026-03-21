import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { mediaRepo } from "@/features/media/repo";
import { ensureMediaRoot, resolveMediaStoragePath } from "@/features/media/storage";
import { getMediaAssetIdsFromMarkdown, getMediaAssetPath, resolveMediaAssetAccess, type MediaAccessMode } from "@/features/media/types";
import { notesRepo } from "@/features/notes/repo";

export type ReadableMediaAsset = {
  accessMode: MediaAccessMode;
  body: Uint8Array<ArrayBuffer>;
  contentType: string;
  sizeBytes: number;
};

const noteImageContentTypes = new Map<string, string>([
  ["image/gif", ".gif"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);
const maxNoteImageBytes = 8 * 1024 * 1024;

function sanitizeUploadFileName(fileName: string, fallbackExtension: string) {
  const normalizedName = path.basename(fileName).trim();
  const extension = path.extname(normalizedName).toLowerCase();
  const baseName = extension ? normalizedName.slice(0, -extension.length) : normalizedName;
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  const finalBaseName = sanitizedBaseName || "note-image";

  return `${finalBaseName}${fallbackExtension}`;
}

function createNoteImageAltText(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const normalized = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  return normalized || "Uploaded image";
}

function getNoteImageExtension(contentType: string) {
  return noteImageContentTypes.get(contentType) ?? null;
}

export async function uploadNoteImage(input: { file: File; noteId: string | null; ownerId: string }) {
  const extension = getNoteImageExtension(input.file.type);

  if (!extension) {
    throw new Error("Upload a PNG, JPG, GIF, or WEBP image.");
  }

  if (input.file.size === 0) {
    throw new Error("Upload a non-empty image.");
  }

  if (input.file.size > maxNoteImageBytes) {
    throw new Error("Upload an image smaller than 8 MB.");
  }

  if (input.noteId) {
    const note = await notesRepo.findByIdForOwner(input.ownerId, input.noteId);

    if (!note) {
      throw new Error("The selected note could not be found.");
    }
  }

  const assetId = randomUUID();
  const fileName = sanitizeUploadFileName(input.file.name, extension);
  const storageScope = input.noteId ?? "drafts";
  const storageKey = `note-images/${storageScope}/${assetId}${extension}`;
  const storagePath = resolveMediaStoragePath(storageKey);
  const body = Buffer.from(await input.file.arrayBuffer());

  await ensureMediaRoot();
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, body);
  await mediaRepo.createNoteImageAsset({
    id: assetId,
    ownerId: input.ownerId,
    noteId: input.noteId,
    storageKey,
    fileName,
    contentType: input.file.type,
    sizeBytes: body.byteLength
  });

  return {
    alt: createNoteImageAltText(fileName),
    assetId,
    fileName,
    url: getMediaAssetPath(assetId)
  };
}

export async function claimNoteImageAssetsForNote(ownerId: string, noteId: string, markdown: string) {
  const assetIds = getMediaAssetIdsFromMarkdown(markdown);

  if (assetIds.length === 0) {
    return;
  }

  await mediaRepo.attachOwnerNoteImagesToNote(ownerId, noteId, assetIds);
}

export async function getReadableMediaAsset(assetId: string, viewerOwnerId: string | null): Promise<ReadableMediaAsset | null> {
  const asset = await mediaRepo.findAccessRecordById(assetId);

  if (!asset) {
    return null;
  }

  const accessMode = resolveMediaAssetAccess(asset, viewerOwnerId);

  if (!accessMode) {
    return null;
  }

  try {
    const body = new Uint8Array(await readFile(resolveMediaStoragePath(asset.storageKey)));

    return {
      accessMode,
      body,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
