# Docker packaging

## Goal
Ship Minakeep as a source-built Docker image with a documented Compose path for mounted data and env-driven runtime config.

## Trigger / Entry
An operator wants to run Minakeep in a container instead of a direct local Node process.

## User-Visible Behavior
- The repo provides a Docker image build path.
- The repo provides `docker-compose.yml` as the primary operator setup.
- Compose mounts persistent paths for SQLite data at `/app/data`, uploaded media and cached favicons at `/app/media`, and logs at `/app/logs`.
- Runtime configuration, including AI env vars, is supplied through environment variables or env files.
- The container startup path runs the existing `db:prepare` contract before serving the built app.

## Validation
- The Docker image builds successfully from the repo source.
- The containerized app startup path stays compatible with mounted volumes and env-driven runtime prep.
- The Compose configuration is valid and documented for operator use through `docker compose config`.
- Mounted DB/media/log paths are clearly defined and not baked into the image.
- `npm run verify` passes, and the Docker task adds its own deterministic build/start proof.
