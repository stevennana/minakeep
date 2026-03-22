# External note API hardening

```json taskmeta
{
  "id": "079-external-note-api-hardening",
  "title": "External note API hardening",
  "order": 79,
  "status": "planned",
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
