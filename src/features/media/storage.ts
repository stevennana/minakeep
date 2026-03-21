import "server-only";

import { mkdir } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/config/env";

function normalizeStorageKey(storageKey: string) {
  const normalizedSegments = storageKey
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean);

  if (normalizedSegments.length === 0) {
    throw new Error("Media storage keys must include at least one path segment.");
  }

  for (const segment of normalizedSegments) {
    if (segment === "." || segment === ".." || segment.includes("\0")) {
      throw new Error(`Invalid media storage key segment: ${segment}`);
    }
  }

  return normalizedSegments.join("/");
}

export function getMediaRoot() {
  return env.mediaRoot;
}

export async function ensureMediaRoot() {
  await mkdir(getMediaRoot(), { recursive: true });
}

export function resolveMediaStoragePath(storageKey: string) {
  const root = path.resolve(getMediaRoot());
  const resolvedPath = path.resolve(root, normalizeStorageKey(storageKey));

  if (!resolvedPath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Resolved media path escaped the configured media root.");
  }

  return resolvedPath;
}
