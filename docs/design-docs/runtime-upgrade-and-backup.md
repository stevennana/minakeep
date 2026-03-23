# Runtime Upgrade And Backup

## Goal
Keep self-hosted and Docker upgrades safe when Minakeep introduces schema-level changes.

## Upgrade Rules
- schema-changing releases must define an upgrade path from an older working Minakeep install to the new version
- the release/runtime path should not assume a fresh SQLite database
- the startup/upgrade contract should remain compatible with the shipped mounted data path

## Backup Rules
- before an automatic schema upgrade runs, Minakeep should create a timestamped SQLite backup
- backup location and restore expectations must be documented for operators
- backup behavior should be deterministic and operator-visible rather than silent

## Operator Rules
- self-hosted direct-Node and Docker operators should both have a documented path for moving from the older version to the newer version
- upgrade guidance should name the exact runtime-prep or startup path that performs the backup and schema-update work
- the upgrade contract should be durable enough to support future schema changes, not just one ad hoc release

