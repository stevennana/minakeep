# Docker packaging

## Goal
Ship Minakeep as a source-built Docker image with a documented Compose path for mounted data and env-driven runtime config.

## Trigger / Entry
An operator wants to run Minakeep in a container instead of a direct local Node process.

## User-Visible Behavior
- The repo provides a source-built multi-stage Docker image build path.
- The repo provides `docker-compose.yml` as the primary operator setup.
- The shipped Compose file binds `./data`, `./media`, and `./logs` into the fixed container paths `/app/data`, `/app/media`, and `/app/logs`.
- Runtime configuration, including AI env vars, is supplied through environment variables or env files.
- Optional demonstration-user credentials are supplied through environment variables or env files, parallel to the owner credentials.
- Demo credentials follow a both-or-neither env contract, `DEMO_USERNAME` must differ from `OWNER_USERNAME`, and the demo identity stays runtime-only rather than being seeded into SQLite.
- Optional AI env vars may stay unset in the shipped Compose example so owner-only boot works without placeholder endpoint values.
- The container startup path ensures the mounted runtime directories exist, writes a timestamped server log under `/app/logs`, runs the existing `db:prepare` contract, and then serves the built app on `0.0.0.0:$PORT`.
- When the Compose-default SQLite path is used, pre-upgrade backups are written under `/app/data/backups/` inside the mounted data volume.
- The shipped Compose service includes an HTTP healthcheck against `/api/health`.
- When a released version introduces a schema change, the self-host/Docker path provides an upgrade-safe contract for older working installs.
- The upgrade-safe contract includes an automatic SQLite backup before the schema-upgrade step runs.

## Validation
- The Docker image builds successfully from the repo source.
- The containerized app startup path stays compatible with mounted volumes and env-driven runtime prep.
- The Compose configuration is valid and documented for operator use through `docker compose config`.
- Mounted DB/media/log paths are clearly defined and not baked into the image.
- Mounted SQLite backups stay inside the same operator-owned data bind mount so restore does not depend on image internals.
- Demo-user env handling is documented and stays aligned with the direct local runtime contract.
- Schema-changing releases document and exercise an upgrade path from an older working Minakeep install to the new version.
- Automatic pre-upgrade SQLite backups are documented and operator-visible.
- `npm run verify` passes, and the Docker path keeps its build/config proof explicit through `docker build -t minakeep:test .` plus `docker compose config` instead of relying on prose alone.
