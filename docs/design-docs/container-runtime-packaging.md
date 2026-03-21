# Container Runtime Packaging

## Goal
Package Minakeep as a production-style container image with a Compose-driven operator path.

## Primary Operator Path
- ship a Dockerfile that builds the app from source
- ship a documented Docker Compose example as the primary deployment path
- treat `docker run` as a secondary example, not the main operating model

## Volume Rules
- mount SQLite data
- mount uploaded media and cached favicons
- mount logs
- avoid baking mutable DB/media/log data into the image itself

## Config Rules
- pass runtime secrets and config through env vars or env files
- include AI env handling for `LLM_BASE`, `TOKEN`, and `MODEL`
- keep the container path compatible with the existing local env contract instead of inventing a second config model

## Verification Rules
- the Docker wave must prove image build success
- the Docker wave must prove the built container can boot the app against mounted volumes
- Compose configuration should be deterministic and documented enough for operator handoff

## Anti-Goals
- no Kubernetes manifests
- no multi-host orchestration templates
- no object-storage dependency as a prerequisite for container support
