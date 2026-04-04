# Mermaid wave hardening

```json taskmeta
{
  "id": "095-mermaid-wave-hardening",
  "title": "Mermaid wave hardening",
  "order": 95,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-mermaid-regression",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "src/features/notes",
    "src/features/public-content",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The Mermaid wave still relies on stale queue/docs wording that no longer matches shipped behavior.",
    "Cross-surface Mermaid coverage passes only in isolation but still drifts in the full verify path.",
    "Fallback, screenshot, or responsive regressions remain unprotected after the feature wave lands."
  ],
  "completed_at": "2026-04-04T04:34:00Z"
}
```

## Objective

Close the Mermaid tranche by proving the renderer, public note reading, and editor preview stay aligned under one deterministic replay path.

## Scope

- Mermaid regression bundle for public note reading and editor preview
- final doc and queue alignment for the shipped Mermaid wave
- snapshot and responsive proof for the new diagram surfaces

## Out of scope

- new diagram syntaxes beyond Mermaid fences
- additional editor productivity features
- non-note markdown rendering changes

## Exit criteria

1. One Mermaid regression command replays the shipped public and owner diagram surfaces.
2. Supporting docs and the active/completed queue reflect the actual Mermaid implementation shape.
3. The full repo gate still passes after Mermaid coverage joins the suite.
4. `npm run test:e2e -- --grep @ui-mermaid-regression` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-mermaid-regression`
- `npm run verify`

## Evaluator notes

Promote only when the Mermaid wave reads as a finished shipped slice with stable regression coverage instead of a feature branch that never reconciled its queue and docs.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T04:21:23.431Z: restored as current task after 094-editor-mermaid-preview promotion.
- 2026-04-04T04:34:00Z: confirmed the shared Mermaid renderer, public note page, and owner preview were already aligned; the blocking gap was missing bundled `@ui-mermaid-regression` coverage, which left the task's required replay command with no matching tests.
- 2026-04-04T04:34:00Z: tagged the public-note and editor Mermaid Playwright specs with `@ui-mermaid-regression` and updated the UI verification contract so the hardening command now deterministically replays desktop/mobile public reading plus desktop/mobile owner preview surfaces from the shipped Mermaid path.
- 2026-04-04T04:34:00Z: verified `npm run test:e2e -- --grep @ui-mermaid-regression` replays all four Mermaid regression surfaces, then ran `npm run verify` successfully so the Mermaid tranche can move from the active queue into completed history.
- 2026-04-04T04:38:36Z: reran the required task commands against the current worktree and reconfirmed the shipped state; `npm run test:e2e -- --grep @ui-mermaid-regression` passed with 4 Mermaid replay tests and `npm run verify` passed end to end, including the full 92-test Playwright suite and startup smoke.
- 2026-04-04T04:46:58Z: revalidated the completed Mermaid wave from the current task prompt; the deterministic Mermaid replay command still passed with 4 tests and the full `npm run verify` gate passed, including the 78-test unit suite, the 92-test Playwright suite, and startup smoke.
- 2026-04-04T04:51:14Z: reran the required Mermaid hardening gates from the current workspace state; `npm run test:e2e -- --grep @ui-mermaid-regression` passed with the expected 4 replay tests, and `npm run verify` passed end to end again, including 78 unit tests, 92 Playwright tests, and startup smoke.
- 2026-04-04T04:55:14Z: revalidated the completed Mermaid hardening slice from the current workspace and confirmed the task contract still holds; `npm run test:e2e -- --grep @ui-mermaid-regression` passed with 4 replay tests covering owner preview and public note desktop/mobile surfaces, and `npm run verify` passed end to end again, including 78 unit tests, the full 92-test Playwright suite, and startup smoke.
- 2026-04-04T05:00:30Z: reran the required task commands from the current workspace, reconfirmed the deterministic Mermaid replay bundle still covers the four shipped desktop/mobile owner-preview and public-note surfaces, and verified `npm run verify` passed end to end again with 78 unit tests, 92 Playwright tests, and startup smoke.
