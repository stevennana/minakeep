# Minakeep

Minakeep is a self-hosted notes-and-bookmarks site with private capture, selective publishing, AI enrichment, and a polished knowledge-studio UI.

This bookmark site is inspired by the Karakeep project and is built as a demo for the Mina-Ralph loop skill.

## Online Demo

- demonstration site: https://minakeep.mina.asia/
- demouser: `demo`
- demopassword: `demo`
- you can explore the website using this id and password

## What it does

- private markdown note authoring
- private bookmark capture and management
- selective publishing for notes and links
- public showroom for published content
- AI-generated summaries and tags through a Mina-hosted OpenAI-compatible endpoint
- responsive owner and public UI

## Tech stack

- Next.js App Router
- TypeScript
- Prisma + SQLite
- Playwright
- Ralph-style task loop under `scripts/ralph/`

## Local setup

Install dependencies:

```bash
npm install
```

Prepare the local database:

```bash
npm run db:prepare
```

Reset to a fresh local database state:

```bash
rm -f dev.db dev.db-shm dev.db-wal
npm run db:prepare
```

If you also want a completely clean local media state:

```bash
rm -f dev.db dev.db-shm dev.db-wal
rm -rf media
npm run db:prepare
```

After a DB reset, open a fresh browser tab or do a hard reload before continuing. Old edit pages or upload forms can still hold stale note/link ids and trigger foreign-key errors against the new database.

Configure AI enrichment if you want generated summaries and tags:

```bash
cp .env.example .env.local
```

Required AI environment keys:

```bash
LLM_BASE="https://mina-host.example/v1"
TOKEN="replace-with-a-mina-api-token"
MODEL="replace-with-a-mina-model-id"
```

Optional:

```bash
MINA_AI_TIMEOUT_MS=15000
```

Without `LLM_BASE`, `TOKEN`, and `MODEL`, the app still works for note and bookmark capture, but AI enrichment will stay disabled and saves will continue without generated metadata.

Optional demo-workspace credentials use the same local env file:

```bash
DEMO_USERNAME="demo"
DEMO_PASSWORD="replace-with-a-long-demo-password"
```

Set both demo vars or leave both unset. The app still seeds only the owner account into SQLite; the demo account is an env-backed runtime role for read-only workspace access.

Optional server-to-server external note-create API:

```bash
API_KEY="replace-with-a-long-random-static-key"
```

Leave `API_KEY` unset to keep `POST /api/open/notes` disabled.

Start the app:

```bash
npm run dev
```

Production-style local start:

```bash
npm run start
```

Run the full deterministic verification suite:

```bash
npm run verify
```

## Docker / Compose

Published images are available on Docker Hub, but the shipped Compose contract is source-built from the checked-out repo:

```bash
docker pull stevenna050/minakeep:1.0.1
```

The official release path is multi-arch (`linux/amd64` and `linux/arm64`) and is published from Git tags through GitHub Actions.

Local build for testing:

```bash
docker build -t minakeep:test .
```

Run the primary operator path with Docker Compose against the checked-out source tree:

```bash
cp .env.compose.example .env
mkdir -p data media logs
docker compose up -d --build
```

The compose file fixes the container-internal runtime paths to `/app/data`, `/app/media`, and `/app/logs`; the `.env` file is for auth, port, and optional demo-user and AI config.

The Compose path keeps mutable runtime state mounted outside the image:

- `./data` -> `/app/data` for SQLite, with `DATABASE_URL=file:/app/data/minakeep.db`
- `./media` -> `/app/media` for uploaded note images and cached favicons
- `./logs` -> `/app/logs` for timestamped `start:logged`-style server logs written by the container entrypoint

The container startup path reuses the existing env contract. On each boot it:

1. ensures the mounted DB/media/log directories exist
2. runs `npm run db:prepare`, which creates a timestamped SQLite backup under `/app/data/backups/` before any schema-changing upgrade step
3. starts `next start` on `0.0.0.0:$PORT`

Required auth/runtime env vars for Compose:

```bash
AUTH_SECRET="replace-with-a-long-random-secret"
OWNER_USERNAME="owner"
OWNER_PASSWORD="replace-with-a-long-password"
```

Optional demo-workspace env vars follow the same both-or-neither rule:

```bash
DEMO_USERNAME="demo"
DEMO_PASSWORD="replace-with-a-long-demo-password"
```

Leave both demo vars unset to run the normal owner-only deployment. If you enable the demo workspace, keep `DEMO_USERNAME` different from `OWNER_USERNAME`; Compose passes the demo credentials through to the container at runtime, but `npm run db:prepare` still persists only the owner password hash in SQLite and the demo account remains read-only.

Optional AI env vars use the same local contract as direct Node runs. Leave them unset unless you want live AI enrichment in the container:

```bash
LLM_BASE="https://mina-host.example/v1"
TOKEN="replace-with-a-mina-api-token"
MODEL="replace-with-a-mina-model-id"
MINA_AI_TIMEOUT_MS="15000"
```

Inspect the resolved Compose configuration:

```bash
docker compose config
```

Follow operator logs:

```bash
docker compose logs -f app
```

## Upgrades and restore

Direct Node/self-host upgrades:

1. stop the running Minakeep process
2. update the repo to the new release and run `npm install`
3. run `npm run db:prepare`
4. run `npm run build`
5. start the app with `npm run start` or `npm run start:logged`

`npm run db:prepare` is the upgrade contract for direct Node installs. If the current `DATABASE_URL` points at an existing SQLite file and the new release needs schema changes, Minakeep creates a timestamped pre-upgrade backup under a sibling `backups/` directory before `prisma db push` runs. For the default local path `file:./dev.db`, backups land under `./backups/<db-name>-pre-upgrade-<timestamp>/`.

`npm run start:logged` already runs `npm run db:prepare` before the server starts, so operators using that wrapper get the same automatic backup behavior on upgrade.

Compose/Docker upgrades:

1. update the repo checkout to the new release and adjust `.env` if that release needs config changes
2. rebuild and restart the Compose service with `docker compose up -d --build`
3. inspect `docker compose logs -f app` for the backup path and a clean startup

The shipped `docker-compose.yml` builds the local checkout into `minakeep:local` before starting the container, so `docker compose pull` is not the primary upgrade path for this repo-managed Compose setup.

Optional published-image flow:

1. pull the tag you want, for example `docker pull stevenna050/minakeep:1.0.1`
2. run that image directly with equivalent env vars and mounted `data`, `media`, and `logs` paths, or override the Compose service image intentionally

The container entrypoint reuses the same `npm run db:prepare` contract. With the shipped Compose defaults, the live SQLite file is `/app/data/minakeep.db` and pre-upgrade backups land under `/app/data/backups/<db-name>-pre-upgrade-<timestamp>/`, which appears on the host as `./data/backups/...`.

SQLite restore path:

Direct Node/self-host restore with the default local SQLite path:

1. stop the running Minakeep process
2. copy the backup files from `./backups/<db-name>-pre-upgrade-<timestamp>/` back into the repo root, replacing `dev.db` and any matching `dev.db-wal` or `dev.db-shm` files
3. restart the release you want to run after the restore

Compose/Docker restore with the shipped Compose defaults:

1. run `docker compose down`
2. copy the backup files from `./data/backups/<db-name>-pre-upgrade-<timestamp>/` back into `./data`, replacing `minakeep.db` and any matching `minakeep.db-wal` or `minakeep.db-shm` files
3. restart the release you want to run after the restore

If you use a custom `DATABASE_URL`, restore the backup files over that configured SQLite filename instead of the defaults above.

Future image releases:

- push a new Git tag such as `1.0.2`
- GitHub Actions builds and pushes `stevenna050/minakeep:<tag>`
- stable tags also refresh `stevenna050/minakeep:latest`

## External note API

Minakeep exposes one server-to-server note-create endpoint:

```text
POST /api/open/notes
```

Authentication:

- header: `X-API-Key: <API_KEY>`
- server-to-server only
- no CORS support in this wave

Request body:

```json
{
  "title": "Example note",
  "markdown": "# Heading\n\nBody text",
  "isPublished": true
}
```

Rules:

- `title` must be a string
- `markdown` must be a string
- `isPublished` is optional and must be a boolean when present
- unsupported fields are rejected
- if `isPublished` is omitted, the created note stays private

Responses:

- `201` created
- `400` invalid JSON or unsupported/invalid fields
- `401` missing or invalid `X-API-Key`
- `503` API disabled because `API_KEY` is unset, or owner account unavailable

Success response shape:

```json
{
  "note": {
    "id": "cm123...",
    "title": "Example note",
    "slug": "example-note",
    "isPublished": true
  },
  "ownerUrl": "/app/notes/cm123.../edit",
  "publicUrl": "/notes/example-note"
}
```

If the note stays private, `publicUrl` is `null`.

`curl` example:

```bash
curl -X POST http://127.0.0.1:3000/api/open/notes \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "title": "Remote API note",
    "markdown": "# Remote API note\n\nCreated from curl.",
    "isPublished": true
  }'
```

API-created notes are written under the single owner account and enter the same AI enrichment flow as UI-created notes.

## Useful commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
npm run start:smoke
./scripts/ralph/status.sh
```

Run the real-endpoint AI check when the AI env vars are configured:

```bash
npm run test:e2e -- --grep @ai-real
```

Run the demo-auth foundation coverage:

```bash
npm run test:e2e -- --grep @demo-user
```

## Project structure

- `src/` application code
- `docs/` product specs, design docs, and execution plans
- `scripts/ralph/` Ralph loop scripts and operator helpers
- `state/` Ralph state, artifacts, and run history
- `tests/` unit and end-to-end coverage

## Notes

- The repo uses the docs tree as the system of record for product and execution planning.
- Active work is tracked in `docs/exec-plans/active/`.
- Completed task history is preserved in `docs/exec-plans/completed/`.
- AI credentials are server-only and should stay in local or shell environment, not committed project files.
- Docker Compose is the primary container deployment path; `docker run` is a secondary fallback, not the main operator model.

## Build journey

This project was built through the Mina-Ralph loop workflow rather than by hand-coding one large feature branch.

The practical flow was:

1. bootstrap the repo around docs-first planning, a Next.js scaffold, and the Ralph task loop
2. define a small active queue with explicit promotion gates
3. implement one task at a time
4. run deterministic checks
5. promote the next task only when the required checks passed
6. reopen planning when one queue wave was exhausted

The Mina-Ralph skill handled the repeatable engineering loop:

- write and refresh product specs, design docs, and exec plans
- keep the repo-local docs tree as the system of record
- implement scoped tasks from the active queue
- run verification commands and Playwright coverage
- maintain Ralph state, task history, and promotion flow

The founder still guided the product direction between waves. In other words, this repository was not created with zero human input; it was built through founder-directed wave planning plus skill-driven implementation and verification.

### Major waves so far

- bootstrap foundation and core note flow
- public note publishing
- private link capture plus owner retrieval
- AI enrichment foundation, note AI, and link AI
- broad UI refresh and owner-workspace density work
- public mixed showroom, public link publishing, and public title-only search
- public-home density refinement
- markdown editor workbench, toolbar, modes, mobile workflow, and hardening

For the concrete promotion history, see [state/task-history.md](state/task-history.md).
