# RELIABILITY.md

## Purpose
Define the reliability expectations and failure-handling rules for Minakeep.

## Core Reliability Rules
- every task must name deterministic checks explicitly
- stateful runtime prep must be explicit rather than hidden inside build or test scripts
- operational artifacts under `state/` and `logs/` should be stable and inspectable
- AI enrichment failures must not block note or link persistence
- external AI verification must be explicit instead of assumed from unit tests alone

## Verification
- `npm run db:prepare` prepares SQLite state and owner seed deterministically
- `npm run start:smoke` boots the production-style server and probes a health endpoint
- `npm run verify` includes startup proof alongside code-level checks
- Ralph status and backlog rendering must work without hand-editing state files
- AI tasks must require a real-endpoint E2E check when `LLM_BASE`, `TOKEN`, and `MODEL` are present
- the real-endpoint Playwright path is tagged `@ai-real`, and promotable AI tasks must pass `npm run test:e2e -- --grep @ai-real` when those env vars are configured
- `npm run verify` does not replace the separate `@ai-real` run for promotable AI work

## Runtime Startup Contract
If the app depends on persistent runtime state, document how runtime preparation happens and how a production-style startup smoke proves the `start` path actually works.
For Minakeep, `npm run db:prepare` is the explicit runtime-prep step and `npm run start:smoke` must be able to boot the built app and probe `/api/health`.

## Operator Logging
Document how `npm run start:logged` writes operator-visible server logs into `logs/`, which environment variable controls the log level, and which levels are supported for manual debugging.
Generated server code should expose at least `trace`, `debug`, `info`, `warn`, and `error` logging without dumping secrets or full sensitive payloads by default.
Minakeep writes timestamped `logs/server-*.log` files and prints the created path before the server continues running.
Playwright-backed verification also writes Next.js server output to a per-cycle `*-next-server.log` artifact when the Ralph evaluator sets `MINAKEEP_NEXT_SERVER_LOG`.

## Test Strategy
Document which behaviors are protected by unit tests, which flows require end-to-end coverage, and which command failures block task promotion.
When tests cover subtle or business-critical behavior, capture why those tests exist so future loops do not weaken them casually.
If a user-visible behavior depends on an outside resource such as AI chat or a third-party service, require end-to-end coverage before promotion.
For the AI enrichment wave, E2E must prove: note save with generated metadata, link save with generated metadata, and save-with-visible-failure when the endpoint fails or times out.
The shared helper under `tests/e2e/ai-real.ts` is the contract point for checking whether those env vars are present before running real-endpoint journeys.
Pending owner views should auto-refresh while enrichment is running, and retry should be a visible action only from a failed state rather than a second control path for already-pending work.

## Known Gaps
- there is no external redundancy or multi-node failover in v1
- startup and test commands assume local Node and Playwright browser availability
- E2E verification stays serial because the single-owner flows share one mutable SQLite runtime state
- `start:logged` is intended for operator inspection, not for Ralph automation
- external AI reliability will depend on the Mina-hosted endpoint and the quality of visible retry/failure handling
- AI retries are still operator-triggered and immediate; v1 has no deferred queue, backoff, or attempt history beyond the current visible status

## Environment-Specific Verification Blockers
If the direct operator path passes but the current sandboxed or wrapped runner still fails, record that separately from normal product bugs and escalate it explicitly instead of hiding it inside generic “not done” wording.
Do the same when `@ai-real` cannot run because `LLM_BASE`, `TOKEN`, and `MODEL` are missing or the Mina endpoint is unavailable: record that as an external-env blocker, not as a silent product regression.
