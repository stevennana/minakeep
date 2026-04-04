# RCA: Flowchart advanced Mermaid features blocker

```json taskmeta
{
  "id": "100-flowchart-advanced-mermaid-features-rca-npm-run-verify-auth-spec-delete-spec-e5cc86b6",
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
  "blocker_signature": "deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts",
  "blocker_kind": "deterministic_failure",
  "blocker_summary": "Repeated required-command failure: npm run verify (auth.spec.ts, delete.spec.ts, demo-user.spec.ts, home.spec.ts, incremental-loading.spec.ts, link-ai-real.spec.ts, link-favicon.spec.ts, media-foundation.spec.ts, note-ai-real.spec.ts, note-api.spec.ts, note-image-upload.spec.ts, owner-session.spec.ts, public-home-search.spec.ts, seo-discovery.spec.ts, settings.spec.ts, ui-forms.spec.ts, ui-home-grid.spec.ts, ui-home-shell.spec.ts, ui-information-density.spec.ts, ui-note-editor-foundation.spec.ts, ui-note-editor-mermaid.spec.ts, ui-note-editor-mobile.spec.ts, ui-note-editor-modes.spec.ts, ui-note-editor-toolbar.spec.ts, ui-note-images.spec.ts, ui-note-math.spec.ts, ui-owner-dashboard.spec.ts, ui-owner-secondary.spec.ts, ui-public-home-density.spec.ts, ui-public-note-math.spec.ts, ui-public-note-mermaid.spec.ts, ui-public-note.spec.ts, ui-public-showroom.spec.ts, ui-public-tag-fit.spec.ts, ui-system.spec.ts)"
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
- unrelated cleanup outside the blocker signature `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts`
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
- Blocker summary: Repeated required-command failure: npm run verify (auth.spec.ts, delete.spec.ts, demo-user.spec.ts, home.spec.ts, incremental-loading.spec.ts, link-ai-real.spec.ts, link-favicon.spec.ts, media-foundation.spec.ts, note-ai-real.spec.ts, note-api.spec.ts, note-image-upload.spec.ts, owner-session.spec.ts, public-home-search.spec.ts, seo-discovery.spec.ts, settings.spec.ts, ui-forms.spec.ts, ui-home-grid.spec.ts, ui-home-shell.spec.ts, ui-information-density.spec.ts, ui-note-editor-foundation.spec.ts, ui-note-editor-mermaid.spec.ts, ui-note-editor-mobile.spec.ts, ui-note-editor-modes.spec.ts, ui-note-editor-toolbar.spec.ts, ui-note-images.spec.ts, ui-note-math.spec.ts, ui-owner-dashboard.spec.ts, ui-owner-secondary.spec.ts, ui-public-home-density.spec.ts, ui-public-note-math.spec.ts, ui-public-note-mermaid.spec.ts, ui-public-note.spec.ts, ui-public-showroom.spec.ts, ui-public-tag-fit.spec.ts, ui-system.spec.ts)
- Blocker signature: `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts`
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
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T222413-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T224349-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`
- Artifact: `/Users/stevenna/WebstormProjects/minakeep/state/artifacts/20260404T225229-100-flowchart-advanced-mermaid-features/npm-run-verify-next-server.log`

## Progress log

- 2026-04-04T14:00:36.980Z: Auto-generated RCA/fix plan for repeated blocker `deterministic_failure|npm-run-verify|tests/e2e/auth.spec.ts|tests/e2e/delete.spec.ts|tests/e2e/demo-user.spec.ts|tests/e2e/home.spec.ts|tests/e2e/incremental-loading.spec.ts|tests/e2e/link-ai-real.spec.ts|tests/e2e/link-favicon.spec.ts|tests/e2e/media-foundation.spec.ts|tests/e2e/note-ai-real.spec.ts|tests/e2e/note-api.spec.ts|tests/e2e/note-image-upload.spec.ts|tests/e2e/owner-session.spec.ts|tests/e2e/public-home-search.spec.ts|tests/e2e/seo-discovery.spec.ts|tests/e2e/settings.spec.ts|tests/e2e/ui-forms.spec.ts|tests/e2e/ui-home-grid.spec.ts|tests/e2e/ui-home-shell.spec.ts|tests/e2e/ui-information-density.spec.ts|tests/e2e/ui-note-editor-foundation.spec.ts|tests/e2e/ui-note-editor-mermaid.spec.ts|tests/e2e/ui-note-editor-mobile.spec.ts|tests/e2e/ui-note-editor-modes.spec.ts|tests/e2e/ui-note-editor-toolbar.spec.ts|tests/e2e/ui-note-images.spec.ts|tests/e2e/ui-note-math.spec.ts|tests/e2e/ui-owner-dashboard.spec.ts|tests/e2e/ui-owner-secondary.spec.ts|tests/e2e/ui-public-home-density.spec.ts|tests/e2e/ui-public-note-math.spec.ts|tests/e2e/ui-public-note-mermaid.spec.ts|tests/e2e/ui-public-note.spec.ts|tests/e2e/ui-public-showroom.spec.ts|tests/e2e/ui-public-tag-fit.spec.ts|tests/e2e/ui-system.spec.ts` while working on `100-flowchart-advanced-mermaid-features`.
- 2026-04-04T14:04:39Z: audited the blocker artifacts and confirmed the repeated signature came from the full `npm run verify` path while `LLM_BASE`, `TOKEN`, and `MODEL` were set, which enabled `@ai-real` coverage inside `playwright test`; the historical failures were `tests/e2e/link-ai-real.spec.ts` and `tests/e2e/note-ai-real.spec.ts` timing out after the Mina endpoint returned no completion content.
- 2026-04-04T14:04:39Z: reran `npm run verify` in the current workspace with the same real-AI env keys present and the blocker signature did not recur; both historically failing real-endpoint specs passed (`link-ai-real.spec.ts` in 6.3s and `note-ai-real.spec.ts` in 3.6s), the full E2E suite passed `92/92`, and `npm run verify` exited `0`.
- 2026-04-04T14:04:39Z: this RCA required no new product/code changes; the blocker is conclusively explained as a stale/resolved real-endpoint failure outside the Mermaid flowchart slice, and the parent task log now records the passing verify rerun so normal promotion can return to `100-flowchart-advanced-mermaid-features` without manual queue edits.
