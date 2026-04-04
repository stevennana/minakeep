# Public Mermaid note reading

```json taskmeta
{
  "id": "093-public-mermaid-note-surfaces",
  "title": "Public Mermaid note reading",
  "order": 93,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "094-editor-mermaid-preview",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-reading.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-public-note-mermaid",
    "npm run verify"
  ],
  "required_files": [
    "src/app/notes/[slug]/page.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Published note pages still expose raw Mermaid fences instead of rendered diagrams.",
    "Diagram rendering on public note pages diverges from the shared markdown rendering contract used by owner preview.",
    "Public note Mermaid output causes overflow or unstable fallback behavior on narrow viewports."
  ],
  "completed_at": "2026-04-04T04:05:43.217Z"
}
```

## Objective

Expose Mermaid diagrams on published note pages through the existing shared note-reading path.

## Scope

- Mermaid rendering on `/notes/[slug]`
- responsive and accessibility-safe public styling for diagrams
- dedicated public-surface Playwright coverage

## Out of scope

- owner workbench preview
- Mermaid toolbar helpers
- non-note public surfaces

## Exit criteria

1. Published note pages render Mermaid diagrams inline with the article body through the shared note renderer.
2. Desktop and mobile public note surfaces stay readable, bounded, and accessible.
3. `npm run test:e2e -- --grep @ui-public-note-mermaid` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when the public Mermaid wave feels like part of the shipped note-reading experience and does not leak diagram-specific chrome or raw fenced content.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T03:57:08.721Z: restored as current task after 092-mermaid-renderer-foundation promotion.
- 2026-04-04T03:59:00Z: added a public-note Mermaid surface hook, tightened published-note Mermaid sizing and fallback containment in `src/app/globals.css`, and added dedicated Playwright coverage tagged `@ui-public-note-mermaid` for rendered and fallback Mermaid blocks on desktop and mobile.
- 2026-04-04T04:05:43.217Z: automatically promoted after deterministic checks and evaluator approval.
