# External note API hardening

```json taskmeta
{
  "id": "079-external-note-api-hardening",
  "title": "External note API hardening",
  "order": 79,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/external-note-api.md",
    "docs/design-docs/external-note-api-boundary.md",
    "docs/product-specs/public-note-publishing.md",
    "docs/product-specs/note-ai-enrichment.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @note-api",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    ".env.example",
    ".env.compose.example",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Docs drift from the shipped request/response contract or env requirements.",
    "Regression coverage misses fail-closed auth behavior or publish-on-create visibility.",
    "The route introduces browser-origin behavior or other out-of-scope expansion."
  ]
}
```

## Objective

Harden the external note API through docs alignment, regression coverage, and fail-closed behavior checks.

## Scope

- final doc alignment across specs, architecture, security, reliability, and env examples
- regression coverage for valid key, invalid key, missing key, and publish-on-create behavior
- cleanup of any route or test drift from the earlier slices

## Out of scope

- link ingest
- per-client API keys
- browser-origin support or CORS policy work

## Exit criteria

1. The shipped docs describe the external note API contract without leaving auth or publish defaults implied.
2. Regression coverage protects both private note create and publish-on-create flows, plus auth failures.
3. The route still fails closed when `API_KEY` is absent or wrong.
4. `npm run test:e2e -- --grep @note-api` passes.
5. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep @note-api`
- `npm run verify`

## Evaluator notes

Promote only when the docs, tests, and shipped boundary all agree on one static-key, server-to-server note-create feature.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22T09:10:01.221Z: restored as current task after 078-external-note-api-create-and-publish promotion.
- 2026-03-22T09:12:42Z: Aligned the external note API docs across architecture, security, reliability, the product/design boundary docs, and env examples so the shipped contract now states the `503` disabled path, `401` auth failures, private-by-default create behavior, and `publicUrl = null` unless publish-on-create is requested.
- 2026-03-22T09:12:42Z: Extended `@note-api` regression coverage to prove missing-key and wrong-key requests fail closed without persisting notes, while keeping the existing valid private-create, publish-on-create, and request-shape coverage intact.
- 2026-03-22T09:15:56Z: Required checks passed locally. `npm run test:e2e -- --grep @note-api` passed with 5/5 note-api tests green, and `npm run verify` passed including lint, typecheck, build, unit tests, the full 73-test Playwright suite, and `npm run start:smoke`.
