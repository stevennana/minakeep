# Self-host upgrade safety

```json taskmeta
{
  "id": "085-self-host-upgrade-safety",
  "title": "Self-host upgrade safety",
  "order": 85,
  "status": "planned",
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
