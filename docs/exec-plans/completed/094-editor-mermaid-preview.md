# Editor Mermaid preview

```json taskmeta
{
  "id": "094-editor-mermaid-preview",
  "title": "Editor Mermaid preview",
  "order": 94,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "095-mermaid-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-editor-workbench.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-note-editor-mermaid",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Owner preview renders Mermaid differently from the public note page for the same markdown source.",
    "Preview mode mutates or normalizes the raw Mermaid fence content inside the editor.",
    "Mermaid blocks make split mode or mobile preview overflow badly enough that the workbench stops being usable."
  ],
  "completed_at": "2026-04-04T04:21:23.431Z"
}
```

## Objective

Bring the Mermaid rendering contract into the owner workbench preview so authors can validate diagrams before publishing.

## Scope

- Mermaid rendering in split and preview-only editor modes
- mobile preview containment and readability
- invalid Mermaid fallback visibility in the authoring preview
- dedicated editor Playwright coverage

## Out of scope

- Mermaid text-snippet insertion helpers
- non-note authoring surfaces
- public-note card preview heuristics beyond what task 093 defines

## Exit criteria

1. Split mode and preview-only mode render Mermaid diagrams through the same shared note-rendering path used publicly.
2. Invalid Mermaid syntax stays visible as a bounded fallback state without blocking save.
3. Desktop and mobile editor preview remain readable and do not rewrite the markdown source.
4. `npm run test:e2e -- --grep @ui-note-editor-mermaid` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-note-editor-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when Mermaid preview genuinely helps authors review the note body and does not degrade the source-first workbench into a second editor model.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T04:05:43.217Z: restored as current task after 093-public-mermaid-note-surfaces promotion.
- 2026-04-04T04:09:40Z: confirmed owner preview already uses `renderMarkdownToHtml()` like the public note page; task gap was missing editor-specific Mermaid coverage plus bounded fallback styling in authoring preview.
- 2026-04-04T04:09:40Z: tightened editor-preview Mermaid containment in `src/app/globals.css`, updated workbench preview copy to mention Mermaid fences, and added dedicated `@ui-note-editor-mermaid` Playwright coverage for split, preview-only, invalid fallback, and mobile preview behavior.
- 2026-04-04T04:18:30Z: normalized owner note form markdown line endings on save so preview-only review does not rewrite authored Mermaid fences, refreshed the affected editor snapshots, and verified `npm run test:e2e -- --grep @ui-note-editor-mermaid` plus `npm run verify` successfully.
- 2026-04-04T04:21:23.431Z: automatically promoted after deterministic checks and evaluator approval.
