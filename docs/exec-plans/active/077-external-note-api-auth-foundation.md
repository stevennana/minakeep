# External note API auth foundation

```json taskmeta
{
  "id": "077-external-note-api-auth-foundation",
  "title": "External note API auth foundation",
  "order": 77,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "078-external-note-api-create-and-publish",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/external-note-api.md",
    "docs/design-docs/external-note-api-boundary.md",
    "docs/product-specs/note-ai-enrichment.md"
  ],
  "required_commands": [
    "npm run typecheck",
    "npm run test:unit",
    "npm run verify"
  ],
  "required_files": [
    "src/app/api",
    "src/lib",
    "tests/unit",
    ".env.example",
    ".env.compose.example"
  ],
  "human_review_triggers": [
    "The route can write notes without a valid configured API key.",
    "The implementation leaks the API key or full private note payloads through logs or error responses.",
    "The feature introduces browser-session or per-client API key management instead of one env-backed static key."
  ]
}
```

## Objective

Establish the static-key auth boundary and env contract for server-to-server note creation.

## Scope

- `API_KEY` env contract and docs
- `X-API-Key` auth parsing and fail-closed behavior
- route skeleton for `POST /api/open/notes`
- unit coverage for the auth boundary

## Out of scope

- actual note persistence
- publish-on-create behavior
- full response payload polish or regression hardening

## Exit criteria

1. The repo documents `API_KEY` as the only external note-create credential in this wave.
2. The new route boundary fails closed when `API_KEY` is missing, missing from the request, or invalid.
3. The implementation does not introduce CORS support, browser auth, or multi-key management.
4. Unit coverage protects the header and disabled-route rules.
5. `npm run verify` passes.

## Required checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the auth boundary is narrow, server-only, and clearly separate from owner/demo browser-session auth.

## Progress log

- 2026-03-22 15:57 KST: Added a server-only external note API auth helper, a `POST /api/open/notes` skeleton that returns `503` when `API_KEY` is unset and `401` for missing/invalid `X-API-Key`, and env-example notes documenting `API_KEY` as the only credential in this wave.
- 2026-03-22 15:57 KST: Added focused unit coverage for the disabled-route, missing-header, invalid-header, and valid-key stub-path behavior before running the full required command set.
- 2026-03-22 16:00 KST: `npm run typecheck` and `npm run test:unit` passed. `npm run verify` failed in unrelated existing UI Playwright checks for the login surface copy expectations and a mobile tags screenshot (`tests/e2e/ui-forms.spec.ts`, `tests/e2e/ui-information-density.spec.ts`, `tests/e2e/ui-system.spec.ts`, `tests/e2e/ui-owner-secondary.spec.ts`) without changes to those UI source files in this task.
- 2026-03-22 16:06 KST: Re-ran the required command set against the current worktree. `npm run typecheck` and `npm run test:unit` passed again, including the new external note API auth unit tests. `npm run verify` still fails only in the same unrelated existing UI Playwright checks for the login heading/copy expectations and the mobile tags screenshot (`tests/e2e/ui-forms.spec.ts`, `tests/e2e/ui-information-density.spec.ts`, `tests/e2e/ui-system.spec.ts`, `tests/e2e/ui-owner-secondary.spec.ts`).
- 2026-03-22 16:13 KST: Re-validated the existing task-077 worktree against the required docs and command contract. `npm run typecheck` and `npm run test:unit` passed, including the external note API auth coverage. `npm run verify` still fails outside this task boundary in the same four existing Playwright checks: three login-surface expectations still look for the old `Sign in to the private vault.` heading/copy while `src/app/login/page.tsx` now renders `Sign in to the private vault` with updated description text, and the tags mobile snapshot still differs in `tests/e2e/ui-owner-secondary.spec.ts`.
- 2026-03-22 16:19 KST: Re-ran `npm run typecheck`, `npm run test:unit`, and `npm run verify` against the current worktree without broadening task 077. `typecheck` and `test:unit` passed. `verify` still fails only in the same unrelated UI Playwright checks: the login assertions in `tests/e2e/ui-forms.spec.ts`, `tests/e2e/ui-information-density.spec.ts`, and `tests/e2e/ui-system.spec.ts` still expect the old `Sign in to the private vault.` heading text, and `tests/e2e/ui-owner-secondary.spec.ts` still reports the existing mobile tags screenshot diff.
- 2026-03-22 16:26 KST: Re-validated task 077 against the exact required command set without editing the existing auth-boundary implementation. `npm run typecheck` passed, `npm run test:unit` passed with the external note API auth coverage green, and `npm run verify` still fails only in the same unrelated Playwright checks: three login-surface assertions still expect the old `Sign in to the private vault.` heading in `tests/e2e/ui-forms.spec.ts`, `tests/e2e/ui-information-density.spec.ts`, and `tests/e2e/ui-system.spec.ts`, while `tests/e2e/ui-owner-secondary.spec.ts` still reports the existing mobile tags screenshot diff.
- 2026-03-22 17:29 KST: Re-validated the task-077 worktree against the exact required command set after the transient UI failures cleared. `npm run typecheck`, `npm run test:unit`, and `npm run verify` all passed. The shipped slice still stays narrow to one env-backed `API_KEY`, `X-API-Key` parsing, fail-closed auth responses, the `POST /api/open/notes` route skeleton, and focused unit coverage without adding CORS, browser auth, or multi-key management.
