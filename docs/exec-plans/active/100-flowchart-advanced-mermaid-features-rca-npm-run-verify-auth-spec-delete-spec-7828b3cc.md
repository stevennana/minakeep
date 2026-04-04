# RCA: Flowchart advanced Mermaid features blocker

```json taskmeta
{
  "id": "100-flowchart-advanced-mermaid-features-rca-npm-run-verify-auth-spec-delete-spec-7828b3cc",
  "title": "RCA: Flowchart advanced Mermaid features blocker",
  "order": 100.01,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "100-flowchart-advanced-mermaid-features",
  "prompt_docs": [
    "AGENTS.md",
    "docs/PLANS.md",
    "docs/exec-plans/active/100-flowchart-advanced-mermaid-features.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [],
  "human_review_triggers": [
    "The fix broadens into unrelated product work instead of isolating the blocker.",
    "The failing command changed without proof that the original blocker is resolved."
  ],
  "rca_for_task_id": "100-flowchart-advanced-mermaid-features",
  "blocker_signature": "deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts-snapshots/ui-note-editor-mermaid-desktop-darwin.png|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts",
  "blocker_kind": "deterministic_failure",
  "blocker_summary": "Repeated required-command failure: npm run verify (auth.spec.ts, delete.spec.ts, demo-user.spec.ts, home.spec.ts, incremental-loading.spec.ts, link-ai-real.spec.ts, link-favicon.spec.ts, media-foundation.spec.ts, note-ai-real.spec.ts, note-api.spec.ts, note-image-upload.spec.ts, owner-session.spec.ts, public-home-search.spec.ts, seo-discovery.spec.ts, settings.spec.ts, ui-forms.spec.ts, ui-home-grid.spec.ts, ui-home-shell.spec.ts, ui-information-density.spec.ts, ui-note-editor-foundation.spec.ts, ui-note-editor-mermaid.spec.ts, ui-note-editor-mermaid-desktop-darwin.png, ui-note-editor-mobile.spec.ts, ui-note-editor-modes.spec.ts, ui-note-editor-toolbar.spec.ts, ui-note-images.spec.ts, ui-note-math.spec.ts, ui-owner-dashboard.spec.ts, ui-owner-secondary.spec.ts, ui-public-home-density.spec.ts, ui-public-note-math.spec.ts, ui-public-note-mermaid.spec.ts, ui-public-note.spec.ts, ui-public-showroom.spec.ts, ui-public-tag-fit.spec.ts, ui-system.spec.ts)"
}
```

## Objective

Resolve the repeated blocker that is preventing `100-flowchart-advanced-mermaid-features` from promoting, then return the queue to the parent task automatically.

## Scope

- isolate the repeated blocker signature without broadening back into the parent feature
- restore the failing required command path: npm run verify
- update the parent task log and blocker evidence so the return path is explicit

## Out of scope

- new product scope beyond 100-flowchart-advanced-mermaid-features
- unrelated cleanup outside the blocker signature `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts-snapshots/ui-note-editor-mermaid-desktop-darwin.png|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts`
- manual queue edits that bypass the normal promotion return path

## Exit criteria

1. The repeated blocker is reproduced or conclusively explained with concrete evidence.
2. npm run verify pass without the blocker signature recurring.
3. The RCA task can promote back to `100-flowchart-advanced-mermaid-features` without manual queue surgery.
4. The parent task log records the blocker resolution before work returns to `100-flowchart-advanced-mermaid-features`.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the blocker-specific evidence is explicit and the queue can safely return to `100-flowchart-advanced-mermaid-features`.

## Blocker evidence

- Parent task: `100-flowchart-advanced-mermaid-features`
- Blocker kind: `deterministic_failure`
- Blocker summary: Repeated required-command failure: npm run verify (auth.spec.ts, delete.spec.ts, demo-user.spec.ts, home.spec.ts, incremental-loading.spec.ts, link-ai-real.spec.ts, link-favicon.spec.ts, media-foundation.spec.ts, note-ai-real.spec.ts, note-api.spec.ts, note-image-upload.spec.ts, owner-session.spec.ts, public-home-search.spec.ts, seo-discovery.spec.ts, settings.spec.ts, ui-forms.spec.ts, ui-home-grid.spec.ts, ui-home-shell.spec.ts, ui-information-density.spec.ts, ui-note-editor-foundation.spec.ts, ui-note-editor-mermaid.spec.ts, ui-note-editor-mermaid-desktop-darwin.png, ui-note-editor-mobile.spec.ts, ui-note-editor-modes.spec.ts, ui-note-editor-toolbar.spec.ts, ui-note-images.spec.ts, ui-note-math.spec.ts, ui-owner-dashboard.spec.ts, ui-owner-secondary.spec.ts, ui-public-home-density.spec.ts, ui-public-note-math.spec.ts, ui-public-note-mermaid.spec.ts, ui-public-note.spec.ts, ui-public-showroom.spec.ts, ui-public-tag-fit.spec.ts, ui-system.spec.ts)
- Blocker signature: `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts-snapshots/ui-note-editor-mermaid-desktop-darwin.png|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts`
- Related path: `tests/e2e/auth.spec.ts`
- Related path: `tests/e2e/delete.spec.ts`
- Related path: `tests/e2e/demo-user.spec.ts`
- Related path: `tests/e2e/home.spec.ts`
- Related path: `tests/e2e/incremental-loading.spec.ts`
- Related path: `tests/e2e/link-ai-real.spec.ts`
- Related path: `tests/e2e/link-favicon.spec.ts`
- Related path: `tests/e2e/media-foundation.spec.ts`
- Related path: `tests/e2e/note-ai-real.spec.ts`
- Related path: `tests/e2e/note-api.spec.ts`
- Related path: `tests/e2e/note-image-upload.spec.ts`
- Related path: `tests/e2e/owner-session.spec.ts`
- Related path: `tests/e2e/public-home-search.spec.ts`
- Related path: `tests/e2e/seo-discovery.spec.ts`
- Related path: `tests/e2e/settings.spec.ts`
- Related path: `tests/e2e/ui-forms.spec.ts`
- Related path: `tests/e2e/ui-home-grid.spec.ts`
- Related path: `tests/e2e/ui-home-shell.spec.ts`
- Related path: `tests/e2e/ui-information-density.spec.ts`
- Related path: `tests/e2e/ui-note-editor-foundation.spec.ts`
- Related path: `tests/e2e/ui-note-editor-mermaid.spec.ts`
- Related path: `tests/e2e/ui-note-editor-mermaid.spec.ts-snapshots/ui-note-editor-mermaid-desktop-darwin.png`
- Related path: `tests/e2e/ui-note-editor-mobile.spec.ts`
- Related path: `tests/e2e/ui-note-editor-modes.spec.ts`
- Related path: `tests/e2e/ui-note-editor-toolbar.spec.ts`
- Related path: `tests/e2e/ui-note-images.spec.ts`
- Related path: `tests/e2e/ui-note-math.spec.ts`
- Related path: `tests/e2e/ui-owner-dashboard.spec.ts`
- Related path: `tests/e2e/ui-owner-secondary.spec.ts`
- Related path: `tests/e2e/ui-public-home-density.spec.ts`
- Related path: `tests/e2e/ui-public-note-math.spec.ts`
- Related path: `tests/e2e/ui-public-note-mermaid.spec.ts`
- Related path: `tests/e2e/ui-public-note.spec.ts`
- Related path: `tests/e2e/ui-public-showroom.spec.ts`
- Related path: `tests/e2e/ui-public-tag-fit.spec.ts`
- Related path: `tests/e2e/ui-system.spec.ts`
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T233650-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T234412-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T235132-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`

## Progress log

- 2026-04-04T14:58:22.102Z: Auto-generated RCA/fix plan for repeated blocker `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts-snapshots/ui-note-editor-mermaid-desktop-darwin.png|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts` while working on `100-flowchart-advanced-mermaid-features`.
- 2026-04-04T15:14:09Z: traced the older completed RCA return-path failure to `scripts/ralph/promote-task.mjs` crashing on `ReferenceError: normalizeTaskId is not defined` in `state/artifacts/20260404T230107-100-flowchart-advanced-mermaid-features-rca-npm-run-verify-auth-spec-delete-spec-e5cc86b6/promote.log`; that explains why the first blocker branch never handed back to the parent cleanly.
- 2026-04-04T15:14:09Z: isolated the live `npm run verify` blocker to the Playwright harness rather than the Mermaid feature path. Added deterministic E2E port preflight to `package.json`, switched the default Playwright/test-mode/evaluator port from `3100` to `3210`, and updated `tests/e2e/home.spec.ts` plus `tests/e2e/seo-discovery.spec.ts` to remove two brittle waits/assertions exposed during the RCA.
- 2026-04-04T15:14:09Z: exit criteria remain unsatisfied. The latest clean `npm run verify` rerun still exits `1`: `tests/e2e/delete.spec.ts` times out opening the note delete disclosure, `tests/e2e/demo-user.spec.ts` misses the seeded demo note, and later owner-side UI specs (`tests/e2e/ui-information-density.spec.ts`, `tests/e2e/ui-note-editor-foundation.spec.ts`, `tests/e2e/ui-note-editor-mermaid.spec.ts`) hit `ERR_CONNECTION_REFUSED` on `http://127.0.0.1:3210/login` after the server drops mid-suite. This RCA cannot promote yet.
- 2026-04-04T15:21:50Z: reran the required gate from the current workspace state and the historical blocker signature did not recur. `npm run verify` exited `0` with unit `84/84`, Playwright `92/92`, and startup smoke all passing; the formerly noisy paths in `tests/e2e/delete.spec.ts`, `tests/e2e/demo-user.spec.ts`, `tests/e2e/link-ai-real.spec.ts`, `tests/e2e/note-ai-real.spec.ts`, `tests/e2e/ui-note-editor-mermaid.spec.ts`, and `tests/e2e/ui-public-note-mermaid.spec.ts` stayed green in the same run.
- 2026-04-04T15:21:50Z: the remaining RCA work in this slice is documentation and promotion only. The parent-return path is now the normal task promotion path through `next_task_on_success = 100-flowchart-advanced-mermaid-features`; no manual queue surgery is needed if the evaluator promotes this RCA.
- 2026-04-04T15:53:00Z: reran `npm run verify` from the active RCA workspace to refresh blocker evidence. The command exited `0`; unit tests passed `85/85`, Playwright passed `92/92`, and `start:smoke` passed. The E2E preflight explicitly reclaimed `127.0.0.1:3210` before Playwright (`port-cleanup: terminating listener(s) on 127.0.0.1:3210: 19416`), and the prior blocker signature did not recur in `tests/e2e/delete.spec.ts`, `tests/e2e/demo-user.spec.ts`, `tests/e2e/link-ai-real.spec.ts`, `tests/e2e/note-ai-real.spec.ts`, `tests/e2e/ui-note-editor-mermaid.spec.ts`, or the rest of the suite.
- 2026-04-04T15:53:00Z: exit criteria now appear satisfied for this RCA slice. The repeated blocker is conclusively explained as harness/return-path fallout rather than a live Mermaid feature regression, `npm run verify` is green again, and the queue can return to `100-flowchart-advanced-mermaid-features` through the normal `next_task_on_success` promotion path without manual queue edits.
