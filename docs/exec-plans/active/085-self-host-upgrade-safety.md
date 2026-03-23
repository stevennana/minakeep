# Self-host upgrade safety

```json taskmeta
{
  "id": "085-self-host-upgrade-safety",
  "title": "Self-host upgrade safety",
  "order": 85,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "086-next-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/docker-packaging.md",
    "docs/design-docs/container-runtime-packaging.md",
    "docs/design-docs/runtime-upgrade-and-backup.md"
  ],
  "required_commands": [
    "npm run verify",
    "docker compose config"
  ],
  "required_files": [
    "scripts",
    "README.md",
    "docker-compose.yml",
    ".env.compose.example"
  ],
  "human_review_triggers": [
    "Schema-changing releases still rely on undocumented operator luck.",
    "Automatic upgrade runs without a visible SQLite backup path.",
    "The upgrade path works only for fresh installs instead of older working Minakeep sites."
  ]
}
```

## Objective

Provide an upgrade-safe path for self-host and Docker operators when Minakeep introduces schema changes.

## Scope

- automatic pre-upgrade SQLite backup
- runtime upgrade path for older working installs
- self-host and Docker documentation

## Out of scope

- distributed backup storage
- rollback orchestration beyond the documented SQLite restore path
- unrelated UI work

## Exit criteria

1. A schema-changing release defines how an older working Minakeep install upgrades safely.
2. Automatic SQLite backup happens before the schema-upgrade step.
3. The Docker/self-host operator docs explain the upgrade and restore path clearly.
4. `docker compose config` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `docker compose config`

## Evaluator notes

Promote only when the upgrade-safe path is explicit and operator-usable, not just implied by a schema sync helper.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23T04:50:40.993Z: restored as current task after 084-owner-content-deletion promotion.
- 2026-03-23T04:57:25Z: Added a `db:prepare`-owned SQLite upgrade helper that detects schema drift on existing file-based SQLite installs, creates a timestamped pre-upgrade backup under a sibling `backups/` directory, and then lets the existing Prisma `db push` plus seed path continue for both direct Node and container startup.
- 2026-03-23T04:57:25Z: Added deterministic regression coverage for upgrading an older SQLite schema into the current schema while preserving a restore-ready backup copy, and updated the self-host/Docker operator docs to name the upgrade trigger, backup location, and restore steps explicitly.
- 2026-03-23T05:02:19Z: Required checks passed in the final tree. `npm run verify` passed including the new legacy-SQLite upgrade regression plus the full 80-test Playwright suite and `start:smoke`, and `docker compose config` passed on the shipped Compose contract.
