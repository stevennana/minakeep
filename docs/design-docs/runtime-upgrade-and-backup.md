# Runtime Upgrade And Backup

## Goal
Keep self-hosted and Docker upgrades safe when Minakeep introduces schema-level changes.

## Upgrade Rules
- schema-changing releases must define an upgrade path from an older working Minakeep install to the new version
- the release/runtime path should not assume a fresh SQLite database
- the startup/upgrade contract should remain compatible with the shipped mounted data path
- `npm run db:prepare` is the contract point for applying schema updates before a new runtime serves traffic
- `npm run db:prepare` may also apply idempotent compatibility fixes for older persisted rows after the schema sync so the new runtime can still read previously published content

## Backup Rules
- before an automatic schema upgrade runs, Minakeep should create a timestamped SQLite backup
- backup location and restore expectations must be documented for operators
- backup behavior should be deterministic and operator-visible rather than silent
- the backup should live in a sibling `backups/` directory next to the active SQLite file so the restore path stays a straight file copy

## Operator Rules
- self-hosted direct-Node and Docker operators should both have a documented path for moving from the older version to the newer version
- upgrade guidance should name the exact runtime-prep or startup path that performs the backup and schema-update work
- the upgrade contract should be durable enough to support future schema changes, not just one ad hoc release
- with the default local path `file:./dev.db`, backups land under `./backups/<db-name>-pre-upgrade-<timestamp>/`
- with the default Compose path `file:/app/data/minakeep.db`, backups land under `/app/data/backups/<db-name>-pre-upgrade-<timestamp>/`
- restore should mean stopping the app, copying the backup SQLite files back over the active DB files, and then starting the chosen release
