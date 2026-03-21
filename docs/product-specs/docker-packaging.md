# Docker packaging

## Goal
Ship Minakeep as a source-built Docker image with a documented Compose path for mounted data and env-driven runtime config.

## Trigger / Entry
An operator wants to run Minakeep in a container instead of a direct local Node process.

## User-Visible Behavior
- The repo provides a Docker image build path.
- The repo provides a Docker Compose example as the primary operator setup.
- Compose mounts persistent paths for SQLite data, uploaded media, cached favicons, and logs.
- Runtime configuration, including AI env vars, is supplied through environment variables or env files.

## Validation
- The Docker image builds successfully from the repo source.
- The containerized app can boot successfully against mounted volumes.
- The Compose configuration is valid and documented for operator use.
- Mounted DB/media/log paths are clearly defined and not baked into the image.
- `npm run verify` passes, and the Docker task adds its own deterministic build/start proof.
