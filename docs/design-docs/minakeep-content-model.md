# Minakeep Content Model

## Goal
Define the stable content concepts for v1 so note, publish, link, and retrieval work can be implemented without renaming entities midstream.

## Entities

### Owner
- there is one owner account in v1
- the owner authenticates with credentials seeded into SQLite
- all private content belongs to that owner

### Note
- a note has `title`, `slug`, `markdown`, `excerpt`, and shared tags
- a note is draft by default
- a note may be published or unpublished explicitly
- only published notes are visible on public routes

### Link
- a link has `url`, `title`, `summary`, and shared tags
- links remain private in v1
- links are standalone saved items, not note attachments

### Tag
- tags are shared across notes and links
- tags are owner-facing organization primitives, not public taxonomy pages

## Publishing Rules
- publishing applies to notes only
- publishing does not expose the entire private vault
- public routes must exclude drafts and unpublished notes by default

## Retrieval Rules
- search is owner-only in v1
- v1 search targets note titles, link titles, URLs, and tags
- future full-text retrieval work must be proposed as a separate feature wave instead of silently broadening the current contract
