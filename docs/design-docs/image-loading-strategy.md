# Image Loading Strategy

## Goal
Prefer viewport-first media loading across Minakeep without changing the existing media-storage, publish-gating, or markdown-native rendering boundaries.

## Core Decision
- Keep using native `img` elements for note-card images, cached favicons, and rendered markdown images.
- Do not turn this wave into a broad `next/image` migration. Current image sources include owner-gated `/media/:assetId` URLs, cached favicon assets, and arbitrary markdown-authored URLs; the loading policy should sit above that source mix rather than replace it.

## Loading Intent Rules
- Image loading intent should be chosen explicitly by the surface, not hardcoded as always-lazy inside shared image helpers.
- Above-the-fold image media should use eager/high-priority hints.
- Offscreen image media should keep lazy/default-priority hints.
- The eager budget must stay small and surface-specific so the browser fetch queue stays biased toward what is actually visible.

## Surface Budgets
- Public showroom initial render: prioritize at most the first two media-bearing cards in the initial server slice.
- Owner dashboard initial render: prioritize only the first visible note-card image.
- Owner links initial render: prioritize only the first visible favicon.
- Public note reading and owner note preview: prioritize only the first rendered markdown image in the article body.

## Shared Implementation Shape
- `NoteCardImage` and `LinkFavicon` should share one explicit loading-intent contract that maps to native `loading`, `fetchpriority`, and decoding hints.
- The markdown renderer should consume that same contract through a narrow prioritized-image count option instead of hardcoding `loading="lazy"` for every rendered `<img>`.
- Route-level or surface-level components should assign the eager slots so helper components remain deterministic and reusable.
- Accessibility names, media-link destinations, and publish-gated media URLs must stay unchanged by the loading-policy work.

## Anti-Goals
- no eager-loading of an entire initial note/link slice
- no second cover-image model
- no weakening of publish-gated `/media` visibility rules
- no performance story that depends on third-party hotlinked favicon infrastructure
