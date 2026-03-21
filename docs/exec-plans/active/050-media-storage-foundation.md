# Media storage foundation

```json taskmeta
{
  "id": "050-media-storage-foundation",
  "title": "Media storage foundation",
  "order": 50,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "051-note-image-upload-and-embed",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/design-docs/minakeep-content-model.md",
    "docs/design-docs/media-storage-and-serving.md",
    "docs/product-specs/note-image-attachments.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @media-foundation"
  ],
  "required_files": [
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The implementation stores uploaded images inside SQLite blobs.",
    "Draft-note images become public immediately after upload.",
    "Media serving is hardcoded to a non-mounted path with no operator control."
  ]
}
```

## Objective

Introduce the mounted media-storage and serving boundary required for note-image uploads and cached favicons.

## Scope

- media storage root and metadata contract
- publish-gated media visibility rules
- server-backed media delivery boundary

## Out of scope

- note-editor upload UI
- card rendering
- Docker packaging work

## Exit criteria

1. The codebase has one clear mounted-media path for uploaded note images and cached favicons.
2. Draft-note images remain private while published-note images can render publicly.
3. `npm run test:e2e -- --grep @media-foundation` passes.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @media-foundation`

## Evaluator notes

Promote only when the media boundary is clear, mounted-storage based, and consistent with the private-vault model.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 21:36 KST: Added a mounted media boundary with one operator-configurable root (`MEDIA_ROOT`, defaulting to a temp-mounted path), a `MediaAsset` Prisma model shared by note images and link favicons, and a server-backed `/media/[assetId]` route that never exposes raw filesystem paths.
- 2026-03-21 21:36 KST: Enforced publish-gated media visibility in the media service: owners can always resolve their own assets, note images become public only when the note is published and references the media URL in markdown, and link favicons become public only when the linked bookmark is published. Added `@media-foundation` Playwright coverage for draft/private note images, published/public note images, unreferenced note images, and published-link favicons.
- 2026-03-21 21:37 KST: Required gates passed locally: `npm run test:e2e -- --grep @media-foundation` and `npm run verify` both completed successfully against the updated Prisma schema and mounted media route.
