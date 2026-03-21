# Container Runtime Packaging

## Goal
Package Minakeep as a production-style container image with a Compose-driven operator path.

## Primary Operator Path
- ship a Dockerfile that builds the app from source
- ship `docker-compose.yml` as the documented primary deployment path
- treat `docker run` as a secondary example, not the main operating model

## Volume Rules
- mount SQLite data at `/app/data`
- mount uploaded media and cached favicons at `/app/media`
- mount logs at `/app/logs`
- avoid baking mutable DB/media/log data into the image itself

## Config Rules
- pass runtime secrets and config through env vars or env files
- include AI env handling for `LLM_BASE`, `TOKEN`, and `MODEL`
- keep the container path compatible with the existing local env contract instead of inventing a second config model
- keep the primary Compose defaults on `DATABASE_URL=file:/app/data/minakeep.db` and `MEDIA_ROOT=/app/media`
- run the existing `npm run db:prepare` contract on container startup before serving the app

## Verification Rules
- the Docker wave must prove image build success
- the Docker wave must keep the image start path compatible with mounted volumes and the existing runtime-prep contract
- Compose configuration should be deterministic and documented enough for operator handoff, including `docker compose config`

## Anti-Goals
- no Kubernetes manifests
- no multi-host orchestration templates
- no object-storage dependency as a prerequisite for container support
