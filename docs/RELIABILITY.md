# RELIABILITY.md

## Purpose
Define the reliability expectations and failure-handling rules for Minakeep.

## Core Reliability Rules
- every task must name deterministic checks explicitly
- stateful runtime prep must be explicit rather than hidden inside build or test scripts
- operational artifacts under `state/` and `logs/` should be stable and inspectable
- AI enrichment failures must not block note or link persistence
- external AI verification must be explicit instead of assumed from unit tests alone
- public rendering should fail closed when persisted public data is malformed or unsafe
- media and favicon fetch failures must fall back cleanly instead of blocking note save, link save, or public rendering
- external note-create auth failures must fail closed without weakening normal owner note creation
- external note-create requests that omit `isPublished` must stay private by default unless the caller explicitly opts into publish-on-create
- schema-changing releases must keep older working self-host and Docker installs upgradeable without silent data loss

## Verification
- `npm run db:prepare` prepares SQLite state and owner seed deterministically
- demo credentials should seed deterministically when configured, without breaking owner-only startup when they are absent
- `npm run start:smoke` boots the production-style server and probes a health endpoint
- `npm run verify` includes startup proof alongside code-level checks
- Ralph status and backlog rendering must work without hand-editing state files
- Docker packaging keeps explicit daemon-backed proof commands outside `npm run verify`; the shipped contract is `docker build -t minakeep:test .`, `docker compose config`, and a container entrypoint that stays aligned with the same `db:prepare` plus `/api/health` startup path used by direct Node smoke
- AI tasks must require a real-endpoint E2E check when `LLM_BASE`, `TOKEN`, and `MODEL` are present
- the real-endpoint Playwright path is tagged `@ai-real`, and promotable AI tasks must pass `npm run test:e2e -- --grep @ai-real` when those env vars are configured
- `npm run verify` does not replace the separate `@ai-real` run for promotable AI work
- UI-focused tasks must require a dedicated `npm run test:e2e -- --grep @ui-*` command for their scoped surface

## Runtime Startup Contract
If the app depends on persistent runtime state, document how runtime preparation happens and how a production-style startup smoke proves the `start` path actually works.
For Minakeep, `npm run db:prepare` is the explicit runtime-prep step and `npm run start:smoke` must be able to boot the built app and probe `/api/health`.
For the container wave, the shipped image entrypoint must create mounted DB/media/log paths, write operator-visible startup logs, run `npm run db:prepare`, and then serve the built app on `0.0.0.0:$PORT` with `/api/health` still usable for health probes.

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
For the mixed public wave, checks should also prove that stale or manually seeded invalid published-link URLs stay hidden from public routes instead of being rendered optimistically.
For the external note API wave, E2E must prove: valid keyed private note create, valid keyed publish-on-create, rejection of missing `X-API-Key`, and rejection of invalid `X-API-Key` requests. Unit coverage must also keep the disabled `503` fail-closed path protected when `API_KEY` is unset.
For the owner-delete/settings wave, E2E must prove: delete remains blocked until unpublish, delete confirmation is required, and site title/description changes propagate across the shipped shell surfaces.
For the upgrade-safe self-host wave, verification must prove: a schema-changing release can start from an older working SQLite state, automatic backup happens before the upgrade path runs, and the upgraded runtime still boots cleanly.
For the media wave, E2E must prove: note image upload with markdown insertion, owner-visible draft image rendering, public image visibility only after note publish, and favicon fallback when fetch/cache fails.
The hardening contract for that slice is tagged `@media-regression` and must keep the private draft-image boundary plus the favicon fallback-and-refresh path deterministic.
For the UI redesign wave, the tagged `@ui-*` Playwright coverage must prove both `1440x900` desktop and `390x844` mobile behavior, stable screenshots, visible hierarchy anchors/actions, and automated accessibility scanning.
The shared helper under `tests/e2e/ai-real.ts` is the contract point for checking whether those env vars are present before running real-endpoint journeys.
Owner surfaces that render pending enrichment state should auto-refresh while enrichment is running, including the private dashboard, links, search, tags, and note editor routes. Retry should be a visible action only from a failed state rather than a second control path for already-pending work.
Because the Playwright suite shares one mutable SQLite runtime state, the harness runs with one worker for promotion checks instead of relying on cross-worker coordination.

## Known Gaps
- there is no external redundancy or multi-node failover in v1
- startup and test commands assume local Node and Playwright browser availability
- E2E verification is intentionally single-worker because the single-owner flows share one mutable SQLite runtime state
- `start:logged` is intended for operator inspection, not for Ralph automation
- external AI reliability will depend on the Mina-hosted endpoint and the quality of visible retry/failure handling
- AI retries are still operator-triggered and immediate; v1 has no deferred queue, backoff, or attempt history beyond the current visible status
- favicon refresh can still be operator-triggered or save-triggered only; v1 does not require a separate crawler or periodic refresh daemon
- there is still no repo-owned Docker-daemon boot check inside `npm run verify`; container build/config validation stays explicit and must run on a host or CI worker with Docker available

## Environment-Specific Verification Blockers
If the direct operator path passes but the current sandboxed or wrapped runner still fails, record that separately from normal product bugs and escalate it explicitly instead of hiding it inside generic “not done” wording.
Do the same when `@ai-real` cannot run because `LLM_BASE`, `TOKEN`, and `MODEL` are missing or the Mina endpoint is unavailable: record that as an external-env blocker, not as a silent product regression.

For the demo-user wave, E2E must prove both that demonstration login can reach the private workspace and that all write attempts are denied server-side.
