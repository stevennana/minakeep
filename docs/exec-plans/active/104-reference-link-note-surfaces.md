# Reference-link note surfaces

```json taskmeta
{
  "id": "104-reference-link-note-surfaces",
  "title": "Reference-link note surfaces",
  "order": 104,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "105-reference-link-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-reference-links.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/product-specs/public-note-reading.md",
    "docs/design-docs/markdown-reference-link-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-public-note-reference-links",
    "npm run test:e2e -- --grep @ui-note-editor-reference-links",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/components",
    "src/app/globals.css",
    "tests/e2e",
    "docs"
  ],
  "human_review_triggers": [
    "Owner preview and published note reading render the same note references differently.",
    "Inline reference markers are visually hard to discover or too hard to tap on mobile.",
    "The bottom reference section feels bolted on, visually noisy, or breaks reading flow."
  ]
}
```

## Objective

Ship the visible owner-preview and public-note experience for reference links so supported markdown references read as calm, accessible citations instead of raw source syntax.

## Scope

- public note rendering for inline markers and bottom references
- owner preview parity in split and preview-only modes
- responsive spacing, anchor navigation, and bottom-reference styling
- deterministic Playwright coverage for public note and owner preview reference-link behavior

## Out of scope

- additional markdown syntax beyond the supported reference-link contract
- homepage/showroom rendering changes
- editor toolbar shortcuts for reference insertion

## Exit criteria

1. Public note pages render supported reference markers and the bottom `References` section with readable hierarchy.
2. Owner preview matches the same rendered reference behavior in split and preview-only modes.
3. Desktop and mobile surfaces keep markers discoverable, links tappable, and the references section bounded.
4. `npm run test:e2e -- --grep @ui-public-note-reference-links`, `npm run test:e2e -- --grep @ui-note-editor-reference-links`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-reference-links`
- `npm run test:e2e -- --grep @ui-note-editor-reference-links`
- `npm run verify`

## Evaluator notes

Promote only when the shipped surface actually improves reading ergonomics and preview parity instead of just exposing extracted links somewhere below the article.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-13T12:00:35.278Z: restored as current task after 103-markdown-reference-renderer-foundation promotion.
- 2026-04-13 21:06 KST: Refined the shared rendered-markdown reference-link surface so public notes and owner preview now share calmer inline citation markers, a bounded bottom `References` block, stable anchor targets, and mobile-safe spacing from one shared UI path.
- 2026-04-13 21:06 KST: Added deterministic Playwright coverage for public-note and owner-preview reference-link behavior on desktop and mobile, including marker counts, bottom-reference rendering, anchor navigation, new-tab external links, bounded layout checks, and screenshot baselines.
