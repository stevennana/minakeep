# Note editor mobile workflow

```json taskmeta
{
  "id": "048-note-editor-mobile-workflow",
  "title": "Note editor mobile workflow",
  "order": 48,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "049-note-editor-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/design-docs/markdown-editor-workbench.md",
    "docs/design-docs/responsive-ui-rules.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-note-editor-mobile"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Phone widths still attempt a cramped desktop-style split view.",
    "Primary note actions are hard to reach on touch screens.",
    "Mobile preview or edit toggles hide essential authoring context."
  ]
}
```

## Objective

Make the richer markdown workbench genuinely usable on mobile instead of inheriting desktop assumptions.

## Scope

- mobile `Edit` / `Preview` workflow
- touch-friendly authoring controls
- responsive note-editor layout behavior

## Out of scope

- tablet-only optimizations that do not materially affect mobile usability
- public route responsive work
- attachment flows

## Exit criteria

1. Phone widths use a simple, readable note-editor workflow instead of a cramped split layout.
2. Owners can edit, preview, and save notes comfortably on mobile.
3. Touch targets and layout hierarchy remain clear.
4. `npm run test:e2e -- --grep @ui-note-editor-mobile` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-note-editor-mobile`

## Evaluator notes

Promote only when the richer editor remains practical on phones and does not regress into desktop-only UI.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 18:19 KST: Reworked the note editor into a phone-first `Edit` / `Preview` workflow while preserving desktop `Source / Split / Preview`, increased touch-target sizing for toolbar and mode controls, and reclaimed mobile width by removing the gutter on phone layouts.
- 2026-03-21 18:19 KST: Added dedicated `@ui-note-editor-mobile` Playwright coverage for phone workflow, touch-target sizing, desktop split-mode preservation, and refreshed the affected editor UI snapshots after updating existing note-editor regressions.
- 2026-03-21 18:20 KST: `npm run test:e2e -- --grep @ui-note-editor-mobile` passed, and the full `npm run verify` gate passed after the mobile editor workflow changes.
