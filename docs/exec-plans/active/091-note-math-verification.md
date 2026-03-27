# Note math verification

```json taskmeta
{
  "id": "091-note-math-verification",
  "title": "Note math verification",
  "order": 91,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/design-docs/markdown-editor-workbench.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-note-math",
    "npm run test:e2e -- --grep @ui-public-note-math",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "scripts/start-smoke.mjs",
    "src/app",
    "src/features/notes",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Owner preview and published notes render math differently from the same markdown source.",
    "Math helpers broaden the editor into a second document model or heavyweight equation UI.",
    "The verification pass leaves startup-smoke, doc, or regression drift behind the shipped note-math behavior."
  ]
}
```

## Objective

Close the note-math wave by verifying the shipped LaTeX behavior, aligning the queue with the implementation, and catching any residual regression or startup-smoke drift before promotion.

## Scope

- verification of inline `$...$` and block `$$...$$` note math rendering
- owner workbench helper and preview coverage
- published note math coverage
- doc, snapshot, and startup-smoke alignment for the shipped wave

## Out of scope

- new math syntaxes beyond inline and block LaTeX
- link math support
- richer equation editing beyond the current markdown-native helpers

## Exit criteria

1. Owner preview and published note pages render the same inline and block math from one markdown source.
2. The note workbench stays markdown-native while exposing the shipped light math helpers.
3. Regression coverage and snapshots protect the added math surfaces without leaving unrelated queue drift.
4. `npm run test:e2e -- --grep @ui-note-math`, `npm run test:e2e -- --grep @ui-public-note-math`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-note-math`
- `npm run test:e2e -- --grep @ui-public-note-math`
- `npm run verify`

## Evaluator notes

Promote only when the note-math tranche reads as a finished shipped slice rather than a local implementation that bypassed the Ralph queue.

## Progress log

- 2026-03-27T22:48:16+0900: task created to verify and harden the shipped note-math tranche before promotion through the Ralph loop.
- 2026-03-27T22:54:34+0900: verified the shipped note-math slice stays markdown-native end to end: owner workbench helpers insert raw `$...$` and `$$...$$`, owner preview and `/notes/[slug]` both render through the shared `renderMarkdownToHtml` path, and the active queue already points at this closeout task.
- 2026-03-27T22:54:34+0900: required promotion checks passed locally with the shipped math coverage and startup smoke in place: `npm run test:e2e -- --grep @ui-note-math`, `npm run test:e2e -- --grep @ui-public-note-math`, and `npm run verify`.
