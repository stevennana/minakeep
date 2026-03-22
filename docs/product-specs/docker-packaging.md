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
- Demo credentials follow a both-or-neither env contract and stay runtime-only rather than being seeded into SQLite.
- The container startup path ensures the mounted runtime directories exist, writes a timestamped server log under `/app/logs`, runs the existing `db:prepare` contract, and then serves the built app on `0.0.0.0:$PORT`.
- The shipped Compose service includes an HTTP healthcheck against `/api/health`.

## Validation
- The Docker image builds successfully from the repo source.
- The containerized app startup path stays compatible with mounted volumes and env-driven runtime prep.
- The Compose configuration is valid and documented for operator use through `docker compose config`.
- Mounted DB/media/log paths are clearly defined and not baked into the image.
- Demo-user env handling is documented and stays aligned with the direct local runtime contract.
- `npm run verify` passes, and the Docker path keeps its build/config proof explicit through `docker build -t minakeep:test .` plus `docker compose config` instead of relying on prose alone.
