# Broader Mermaid root support

```json taskmeta
{
  "id": "101-broader-mermaid-root-support",
  "title": "Broader Mermaid root support",
  "order": 101,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "102-mermaid-expansion-hardening",
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
    "The docs claim broader Mermaid roots than the deterministic tests actually cover.",
    "Newly supported roots such as `classDiagram` or `stateDiagram-v2` still fall back or render incorrectly while being advertised as shipped.",
    "Malformed syntax for newly supported roots still appears as a successful render instead of failing soft."
  ],
  "completed_at": "2026-04-04T16:11:57.064Z"
}
```

## Objective

Broaden Mermaid root coverage through the new renderer, with deterministic support anchored on `classDiagram` and `stateDiagram` / `stateDiagram-v2` beyond the existing flowchart and sequence support.

## Scope

- broader Mermaid roots, with `classDiagram` and `stateDiagram` / `stateDiagram-v2` as the minimum roots for this wave
- owner preview and public note verification for those roots
- malformed-syntax fallback behavior for newly claimed roots

## Out of scope

- roots that are not explicitly documented and tested in this wave
- interactive Mermaid features
- Mermaid use outside note markdown

## Exit criteria

1. `classDiagram` and `stateDiagram` / `stateDiagram-v2` render through the shared Mermaid path in both public note reading and owner preview.
2. Malformed syntax for those newly supported roots reaches the documented fallback shell.
3. The docs claim only the Mermaid roots that the deterministic tests actually prove.
4. `npm run test:e2e -- --grep @ui-public-note-mermaid`, `npm run test:e2e -- --grep @ui-note-editor-mermaid`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-mermaid`
- `npm run test:e2e -- --grep @ui-note-editor-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when broader-root support is test-backed and the renderer does not silently treat unsupported syntax as a successful diagram.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04 14:41 KST: Confirmed the shared Mermaid root gate in `src/features/notes/mermaid.ts` only allowed `flowchart` / `graph` and `sequenceDiagram`, while the task docs targeted broader deterministic root coverage.
- 2026-04-04 14:47 KST: Expanded the shared Mermaid root allowlist to include `classDiagram`, `stateDiagram`, and `stateDiagram-v2`, keeping unsupported roots on the fallback shell and malformed supported syntax on the render-time fallback path.
- 2026-04-04 14:55 KST: Extended unit coverage and the public-note / owner-preview Mermaid E2E fixtures to prove valid `classDiagram` and `stateDiagram-v2` rendering plus malformed `classDiagram` fallback behavior through the shared renderer.
- 2026-04-04 14:58 KST: Updated the Mermaid product and design docs to claim only the roots covered by deterministic tests in this wave.
- 2026-04-04 23:23 KST: Verified the task gates locally. `npm run test:e2e -- --grep @ui-public-note-mermaid`, `npm run test:e2e -- --grep @ui-note-editor-mermaid`, and `npm run verify` all passed; the only retry needed was a transient `EADDRINUSE` on port `3100` during the first public-note Mermaid run.
- 2026-04-04 23:30 KST: Re-ran the required task gates for this handoff. The two Mermaid-scoped Playwright commands and `npm run verify` all passed locally; the only non-product issue observed was the same avoidable `EADDRINUSE` collision when the two scoped Playwright commands were launched in parallel on the shared port.
- 2026-04-04T16:05:09.724Z: restored as current task after 100-flowchart-advanced-mermaid-features promotion.
- 2026-04-05 01:08 KST: Re-validated the shipped broader-root implementation already present in the shared Mermaid renderer and deterministic tests. `npm run test:e2e -- --grep @ui-public-note-mermaid`, `npm run test:e2e -- --grep @ui-note-editor-mermaid`, and `npm run verify` all passed locally; the only transient failure during this run was an `EADDRINUSE` collision when the two scoped Playwright commands were started in parallel against port `3210`, and the public-note command passed immediately when re-run sequentially.
- 2026-04-04T16:11:57.064Z: automatically promoted after deterministic checks and evaluator approval.
