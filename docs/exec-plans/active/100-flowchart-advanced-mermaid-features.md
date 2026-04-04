# Flowchart advanced Mermaid features

```json taskmeta
{
  "id": "100-flowchart-advanced-mermaid-features",
  "title": "Flowchart advanced Mermaid features",
  "order": 100,
  "status": "blocked",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "101-broader-mermaid-root-support",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-public-note-mermaid",
    "npm run test:e2e -- --grep @ui-note-editor-mermaid",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/markdown.ts",
    "src/app/globals.css",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Flowcharts using `classDef`, `class`, `subgraph`, `linkStyle`, or `style` still degrade unexpectedly or fall back without the docs saying so.",
    "Styled flowcharts render differently between public note reading and owner preview.",
    "Advanced flowchart styling causes overflow, clipping, or unreadable labels on mobile."
  ],
  "blocked_by_task_id": "100-flowchart-advanced-mermaid-features-rca-npm-run-verify-auth-spec-delete-spec-e5cc86b6",
  "blocker_signature": "deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts",
  "blocked_at": "2026-04-04T14:00:36.981Z"
}
```

## Objective

Extend Mermaid flowchart support so styled and grouped flowcharts render as real diagrams instead of requiring users to stay within the basic node-and-edge subset.

## Scope

- `classDef`, `class`, `subgraph`, `linkStyle`, and `style` for Mermaid flowcharts
- public note and owner preview verification for the styled flowchart path
- deterministic screenshot and responsive coverage for advanced flowcharts

## Out of scope

- broader Mermaid root families
- Mermaid click handlers or other interactive commands
- homepage/showroom rendering

## Exit criteria

1. Flowcharts that use `classDef`, `class`, `subgraph`, `linkStyle`, and `style` render successfully through the shared Mermaid renderer.
2. Owner preview and public note pages present the same styled flowchart output from the same markdown source.
3. Desktop and mobile surfaces remain bounded and readable.
4. `npm run test:e2e -- --grep @ui-public-note-mermaid`, `npm run test:e2e -- --grep @ui-note-editor-mermaid`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-mermaid`
- `npm run test:e2e -- --grep @ui-note-editor-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when flowchart styling support is demonstrably broader than the current subset and is protected by deterministic coverage rather than one hand-tested sample.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T13:23:43.647Z: restored as current task after 099-mermaid-library-renderer-foundation promotion.
- 2026-04-04T13:27:00Z: audited the shared Mermaid renderer and confirmed advanced flowchart directives already route through the common library-backed path; the remaining task gap was preserving Mermaid-owned styling and proving the richer flowchart subset deterministically on both surfaces.
- 2026-04-04T13:27:00Z: updated Mermaid regression coverage to seed styled flowcharts with `subgraph`, `classDef`, `class`, `style`, and `linkStyle` in both the public note and owner preview flows, and removed the global label-fill override in `src/app/globals.css` so Mermaid-authored text colors can survive intact.
- 2026-04-04T13:39:02Z: fixed owner-preview parity by remounting the shared `RenderedMarkdown` preview on workbench mode changes so Mermaid enhancement reruns cleanly in both split and preview-only states, refreshed the Mermaid screenshots, and reran the task gates successfully (`@ui-public-note-mermaid` and `@ui-note-editor-mermaid` passed).
- 2026-04-04T13:39:02Z: `npm run verify` cleared lint, typecheck, build, unit, startup prerequisites, and the Mermaid/UI suite, but the overall command remains blocked by unrelated `@ai-real` failures in `tests/e2e/link-ai-real.spec.ts` and `tests/e2e/note-ai-real.spec.ts` where the Mina endpoint returned no completion content.
- 2026-04-04T13:47:51Z: reran `npm run test:e2e -- --grep @ui-public-note-mermaid` and `npm run test:e2e -- --grep @ui-note-editor-mermaid`; both passed again with the styled flowchart fixtures and responsive screenshot assertions intact.
- 2026-04-04T13:47:51Z: reran `npm run verify`; the task-scoped Mermaid coverage passed within the full suite, and the only remaining failures were still the unrelated `@ai-real` checks in `tests/e2e/link-ai-real.spec.ts` and `tests/e2e/note-ai-real.spec.ts`, both failing because the Mina endpoint returned no completion content.
- 2026-04-04T13:56:49Z: reran `npm run test:e2e -- --grep @ui-note-editor-mermaid`; both desktop and mobile owner-preview checks passed with the styled flowchart fixture, shared-renderer assertions, and bounded preview surface intact.
- 2026-04-04T13:56:49Z: reran `npm run test:e2e -- --grep @ui-public-note-mermaid`; both desktop and mobile public-note checks passed with the same styled flowchart fixture, screenshot baselines, and overflow guards intact after a retry when the first launch hit a transient `EADDRINUSE` on port `3100`.
- 2026-04-04T13:56:49Z: reran `npm run verify`; Mermaid-related lint, typecheck, build, unit coverage, startup smoke, and task-scoped UI flows stayed green, while the overall verify command remained blocked only by unrelated real-endpoint failures in `tests/e2e/link-ai-real.spec.ts` and `tests/e2e/note-ai-real.spec.ts` where the Mina endpoint returned HTTP `502` and HTTP `400` respectively.
- 2026-04-04T14:00:36.981Z: repeated blocker `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts` auto-branched into `100-flowchart-advanced-mermaid-features-rca-npm-run-verify-auth-spec-delete-spec-e5cc86b6`. Summary: Repeated required-command failure: npm run verify (auth.spec.ts, delete.spec.ts, demo-user.spec.ts, home.spec.ts, incremental-loading.spec.ts, link-ai-real.spec.ts, link-favicon.spec.ts, media-foundation.spec.ts, note-ai-real.spec.ts, note-api.spec.ts, note-image-upload.spec.ts, owner-session.spec.ts, public-home-search.spec.ts, seo-discovery.spec.ts, settings.spec.ts, ui-forms.spec.ts, ui-home-grid.spec.ts, ui-home-shell.spec.ts, ui-information-density.spec.ts, ui-note-editor-foundation.spec.ts, ui-note-editor-mermaid.spec.ts, ui-note-editor-mobile.spec.ts, ui-note-editor-modes.spec.ts, ui-note-editor-toolbar.spec.ts, ui-note-images.spec.ts, ui-note-math.spec.ts, ui-owner-dashboard.spec.ts, ui-owner-secondary.spec.ts, ui-public-home-density.spec.ts, ui-public-note-math.spec.ts, ui-public-note-mermaid.spec.ts, ui-public-note.spec.ts, ui-public-showroom.spec.ts, ui-public-tag-fit.spec.ts, ui-system.spec.ts)
- 2026-04-04T14:04:39Z: RCA reran the full `npm run verify` path with `LLM_BASE`, `TOKEN`, and `MODEL` still present, confirmed the old real-endpoint blocker signature did not recur, and recorded a clean pass: `tests/e2e/link-ai-real.spec.ts` passed in 6.3s, `tests/e2e/note-ai-real.spec.ts` passed in 3.6s, Playwright passed `92/92`, and `npm run verify` exited `0`. The parent task can resume through the RCA task's normal `next_task_on_success` return path.
