# Docker packaging and Compose

```json taskmeta
{
  "id": "054-docker-packaging-and-compose",
  "title": "Docker packaging and Compose",
  "order": 54,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "055-media-and-container-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/RELIABILITY.md",
    "docs/SECURITY.md",
    "docs/design-docs/container-runtime-packaging.md",
    "docs/product-specs/docker-packaging.md"
  ],
  "required_commands": [
    "npm run verify",
    "docker build -t minakeep:test .",
    "docker compose config"
  ],
  "required_files": [
    "Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    "README.md"
  ],
  "human_review_triggers": [
    "Mutable DB, media, or logs are baked into the image instead of mounted.",
    "AI env handling in the container path diverges from the existing app env contract.",
    "The Docker task promotes from docs alone without image-build proof."
  ],
  "completed_at": "2026-03-21T14:36:23.103Z"
}
```

## Objective

Package Minakeep as a source-built Docker image with a documented Compose deployment path.

## Scope

- Dockerfile
- Compose example
- mounted DB/media/log paths
- env-driven runtime configuration including AI vars

## Out of scope

- orchestration manifests beyond Compose
- object-storage integration
- multi-profile deployment matrix beyond one clear primary path

## Exit criteria

1. The repo builds a production-style Docker image successfully.
2. The repo includes a Compose path with mounted DB, media, logs, and env config.
3. Docker packaging aligns with the existing runtime-prep and AI env contract.
4. `docker build -t minakeep:test .` passes.
5. `docker compose config` passes.
6. `npm run verify` passes.

## Required checks

- `npm run verify`
- `docker build -t minakeep:test .`
- `docker compose config`

## Evaluator notes

Promote only when Docker support is real and operator-usable, not just described in docs.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 22:42:14 KST - Audited the current runtime contract before editing: the app already uses env-driven `DATABASE_URL`, `MEDIA_ROOT`, `LOG_LEVEL`, and Mina AI env vars, so the Docker path will reuse those instead of introducing container-only config.
- 2026-03-21 22:42:14 KST - Added a source-built multi-stage Docker image, `.dockerignore`, and a container startup script that creates mounted runtime paths, runs `npm run db:prepare`, and starts the built app on `0.0.0.0:$PORT`.
- 2026-03-21 22:42:14 KST - Added `docker-compose.yml` as the primary operator path with mounted `data`, `media`, and `logs` directories plus env-driven auth/runtime/AI config, and documented the path in `README.md` and the related packaging docs.
- 2026-03-21 22:51:52 KST - Verified `docker compose config` passes on the new Compose path. The file now fixes the container-internal SQLite and media locations to `/app/data` and `/app/media` so an existing local `.env` cannot silently redirect Compose back to repo-local paths.
- 2026-03-21 22:51:52 KST - `docker build -t minakeep:test .` could not be executed in this runner because access to the local Docker daemon socket is denied by the sandbox. `npm run verify` also remains blocked here: against the current repo-local `dev.db` it hits pre-existing shared-state E2E contamination, and with an isolated temp DB it then fails on the runner's `127.0.0.1:3100` bind restriction before Playwright can start.
- 2026-03-21 23:26:54 KST - Re-ran the required non-Docker checks in the current repo state: `npm run verify` now passes locally end-to-end and `docker compose config` still passes. Also fixed the runtime image to include `prisma.config.ts`, because the container entrypoint reuses `npm run db:prepare` and Prisma loads that config file at startup.
- 2026-03-21 23:33:20 KST - Fixed the remaining image-build blocker in `Dockerfile`: the builder stage now creates a disposable temp runtime path and runs `npm run db:prepare` before `next build`, which is required because the prerendered public homepage still reads published content through Prisma during the build.
- 2026-03-21 23:33:20 KST - Re-verified `npm run verify` passes and `docker compose config` passes in the current repo state. `docker build -t minakeep:test .` is still blocked in this sandbox by Docker daemon permission denial, but the builder-stage contract was reproduced locally with the same build-only env values and a temp SQLite path, and that `db:prepare` + `next build` path now succeeds.
- 2026-03-21T14:36:23.103Z: automatically promoted after deterministic checks and evaluator approval.
