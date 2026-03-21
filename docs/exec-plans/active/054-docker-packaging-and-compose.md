# Docker packaging and Compose

```json taskmeta
{
  "id": "054-docker-packaging-and-compose",
  "title": "Docker packaging and Compose",
  "order": 54,
  "status": "active",
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
  ]
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
