import assert from "node:assert/strict";
import test from "node:test";

import { LinkFavicon, LINK_FAVICON_FALLBACK_PATH } from "../../src/features/links/components/link-favicon";
import { getImageLoadingAttributes } from "../../src/features/media/loading-intent";
import { NoteCardImage } from "../../src/features/notes/components/note-card-image";
import { getOpeningViewportPrioritizedImageCount, renderMarkdownToHtml } from "../../src/features/notes/markdown";

test("getImageLoadingAttributes maps lazy intent to native lazy-loading defaults", () => {
  assert.deepEqual(getImageLoadingAttributes("lazy"), {
    decoding: "async",
    loading: "lazy"
  });
});

test("getImageLoadingAttributes maps prioritized intent to eager high-priority loading", () => {
  assert.deepEqual(getImageLoadingAttributes("prioritized"), {
    decoding: "async",
    fetchPriority: "high",
    loading: "eager"
  });
});

test("NoteCardImage keeps alt text and source while honoring prioritized loading intent", () => {
  const element = NoteCardImage({
    frameClassName: "frame",
    image: {
      alt: "Desk shot",
      src: "/media/image-1"
    },
    imageClassName: "image",
    loadingIntent: "prioritized",
    title: "Studio note"
  });
  const image = element.props.children;

  assert.equal(image.props.alt, "Desk shot");
  assert.equal(image.props.src, "/media/image-1");
  assert.equal(image.props.loading, "eager");
  assert.equal(image.props.decoding, "async");
  assert.equal(image.props.fetchPriority, "high");
});

test("LinkFavicon keeps fallback media paths while honoring lazy loading intent", () => {
  const element = LinkFavicon({
    faviconAssetId: null,
    frameClassName: "frame",
    imageClassName: "image",
    loadingIntent: "lazy"
  });
  const image = element.props.children;

  assert.equal(image.props.src, LINK_FAVICON_FALLBACK_PATH);
  assert.equal(image.props.loading, "lazy");
  assert.equal(image.props.decoding, "async");
  assert.equal(image.props.fetchPriority, undefined);
});

test("renderMarkdownToHtml prioritizes only the configured number of rendered images", () => {
  const html = renderMarkdownToHtml(`![First](/media/first)

![Second](/media/second)`, {
    prioritizedImageCount: 1
  });

  assert.match(html, /<img alt="First" decoding="async" fetchpriority="high" loading="eager" src="\/media\/first" \/>/);
  assert.match(html, /<img alt="Second" decoding="async" loading="lazy" src="\/media\/second" \/>/);
});

test("renderMarkdownToHtml keeps all rendered images lazy when no prioritized budget is assigned", () => {
  const html = renderMarkdownToHtml("![Only](/media/only)");

  assert.match(html, /<img alt="Only" decoding="async" loading="lazy" src="\/media\/only" \/>/);
  assert.doesNotMatch(html, /fetchpriority="high"/);
});

test("getOpeningViewportPrioritizedImageCount spends one slot when the first image lands in the opening content band", () => {
  const markdown = `## Opening image

![Only](/media/only)

Short framing copy keeps the image in the initial reading viewport.`;

  assert.equal(getOpeningViewportPrioritizedImageCount(markdown), 1);
});

test("getOpeningViewportPrioritizedImageCount keeps later article images lazy after deeper opening copy", () => {
  const markdown = `## Deferred image

The opening of this note spends enough room on written setup that the first image should not take the eager slot.

Another paragraph adds more distance before the image arrives, which keeps the browser focused on the opening reading content.

![Later](/media/later)`;

  assert.equal(getOpeningViewportPrioritizedImageCount(markdown), 0);
});
