import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getPlaywrightLinkFaviconTestMode } from "@/features/links/test-mode";
import { linksRepo } from "@/features/links/repo";
import { mediaRepo } from "@/features/media/repo";
import { ensureMediaRoot, resolveMediaStoragePath } from "@/features/media/storage";
import { serverLogger } from "@/lib/logging/server-logger";

type CachedFaviconPayload = {
  body: Uint8Array<ArrayBuffer>;
  contentType: string;
  fileName: string;
};

const maxFaviconBytes = 512 * 1024;
const faviconFetchTimeoutMs = 5000;
const htmlCandidateLimit = 200_000;
const defaultFaviconFileName = "favicon";

const fileExtensionByContentType = new Map<string, string>([
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/svg+xml", ".svg"],
  ["image/vnd.microsoft.icon", ".ico"],
  ["image/webp", ".webp"],
  ["image/x-icon", ".ico"]
]);

function getResponseContentType(response: Response) {
  return response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
}

function isHtmlResponse(response: Response) {
  const contentType = getResponseContentType(response);

  return contentType === "application/xhtml+xml" || contentType.startsWith("text/html");
}

function isImageContentType(contentType: string) {
  return contentType.startsWith("image/");
}

function decodeHtmlAttribute(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function sanitizeFileNameSegment(value: string) {
  const sanitized = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");

  return sanitized || defaultFaviconFileName;
}

function inferContentTypeFromUrl(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();

  if (pathname.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (pathname.endsWith(".png")) {
    return "image/png";
  }

  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (pathname.endsWith(".webp")) {
    return "image/webp";
  }

  if (pathname.endsWith(".avif")) {
    return "image/avif";
  }

  if (pathname.endsWith(".gif")) {
    return "image/gif";
  }

  if (pathname.endsWith(".ico")) {
    return "image/x-icon";
  }

  return "";
}

function getSanitizedFaviconFileName(sourceUrl: string, contentType: string) {
  const parsedUrl = new URL(sourceUrl);
  const rawName = path.basename(parsedUrl.pathname) || defaultFaviconFileName;
  const sanitizedName = sanitizeFileNameSegment(rawName);
  const extension = path.extname(sanitizedName).toLowerCase();
  const inferredExtension = fileExtensionByContentType.get(contentType) ?? "";

  if (extension) {
    return sanitizedName;
  }

  return `${sanitizedName}${inferredExtension}`;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, faviconFetchTimeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractLinkTagAttribute(tag: string, attributeName: string) {
  const match = tag.match(new RegExp(`${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  const rawValue = match?.[2] ?? match?.[3] ?? match?.[4];

  return rawValue ? decodeHtmlAttribute(rawValue.trim()) : "";
}

function linkTagLooksLikeFavicon(tag: string) {
  const relValue = extractLinkTagAttribute(tag, "rel").toLowerCase();

  if (!relValue) {
    return false;
  }

  return relValue.split(/\s+/).some((token) => token.includes("icon"));
}

function extractFaviconCandidatesFromHtml(html: string, pageUrl: string) {
  const candidates: string[] = [];

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];

    if (!linkTagLooksLikeFavicon(tag)) {
      continue;
    }

    const href = extractLinkTagAttribute(tag, "href");

    if (!href) {
      continue;
    }

    try {
      candidates.push(new URL(href, pageUrl).toString());
    } catch {
      continue;
    }
  }

  return candidates;
}

function dedupeUrls(urls: string[]) {
  return [...new Set(urls)];
}

async function resolveFaviconCandidateUrls(targetUrl: string) {
  const fallbackUrl = new URL("/favicon.ico", targetUrl).toString();

  try {
    const response = await fetchWithTimeout(targetUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1"
      },
      redirect: "follow"
    });

    const resolvedPageUrl = response.url || targetUrl;
    const defaultCandidate = new URL("/favicon.ico", resolvedPageUrl).toString();

    if (!response.ok || !isHtmlResponse(response)) {
      return dedupeUrls([defaultCandidate, fallbackUrl]);
    }

    const html = (await response.text()).slice(0, htmlCandidateLimit);

    return dedupeUrls([...extractFaviconCandidatesFromHtml(html, resolvedPageUrl), defaultCandidate, fallbackUrl]);
  } catch {
    return [fallbackUrl];
  }
}

async function fetchCandidateFavicon(url: string): Promise<CachedFaviconPayload | null> {
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    return null;
  }

  const contentType = getResponseContentType(response) || inferContentTypeFromUrl(response.url || url);

  if (!contentType || !isImageContentType(contentType)) {
    return null;
  }

  const body = new Uint8Array(await response.arrayBuffer());

  if (body.byteLength === 0 || body.byteLength > maxFaviconBytes) {
    return null;
  }

  return {
    body,
    contentType,
    fileName: getSanitizedFaviconFileName(response.url || url, contentType)
  };
}

function buildPlaywrightTestFavicon(url: string): CachedFaviconPayload {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const glyph = hostname.slice(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, "") || "MK";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#0f766e"/><circle cx="32" cy="32" r="22" fill="#ecfeff"/><text x="18" y="38" font-size="18" font-family="Arial, sans-serif" fill="#115e59">${glyph}</text></svg>`;

  return {
    body: new TextEncoder().encode(svg),
    contentType: "image/svg+xml",
    fileName: "playwright-favicon.svg"
  };
}

async function resolveLinkFavicon(url: string): Promise<CachedFaviconPayload | null> {
  const testMode = getPlaywrightLinkFaviconTestMode();

  if (testMode === "failure") {
    throw new Error("Configured link favicon fetch failure for Playwright.");
  }

  if (testMode === "success") {
    return buildPlaywrightTestFavicon(url);
  }

  const candidates = await resolveFaviconCandidateUrls(url);

  for (const candidate of candidates) {
    try {
      const resolvedCandidate = await fetchCandidateFavicon(candidate);

      if (resolvedCandidate) {
        return resolvedCandidate;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function cacheLinkFavicon(linkId: string) {
  const link = await linksRepo.findFaviconSourceById(linkId);

  if (!link) {
    return false;
  }

  try {
    const favicon = await resolveLinkFavicon(link.url);

    if (!favicon) {
      serverLogger.warn("Link favicon could not be resolved.", {
        linkId: link.id,
        url: link.url
      });
      return false;
    }

    const storageKey = `favicons/${link.id}/favicon`;
    const storagePath = resolveMediaStoragePath(storageKey);

    await ensureMediaRoot();
    await mkdir(path.dirname(storagePath), { recursive: true });
    await writeFile(storagePath, favicon.body);
    await mediaRepo.upsertLinkFaviconAsset({
      contentType: favicon.contentType,
      fileName: favicon.fileName,
      linkId: link.id,
      ownerId: link.ownerId,
      sizeBytes: favicon.body.byteLength,
      storageKey
    });

    return true;
  } catch (error) {
    serverLogger.warn("Link favicon cache failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
      linkId: link.id,
      url: link.url
    });

    return false;
  }
}
