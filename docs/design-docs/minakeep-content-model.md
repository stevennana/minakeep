# Minakeep Content Model

## Goal
Define the stable content concepts for v1 so note, publish, link, retrieval, and AI enrichment work can be implemented without renaming entities midstream.

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
- a note may also carry AI-generated summary/tag metadata and visible enrichment status
- a note may embed uploaded image references in markdown
- the first embedded markdown image is the derived note card image in this wave

### Link
- a link has `url`, `title`, `summary`, and shared tags
- links are standalone saved items, not note attachments
- a link is private by default
- a link may be published or unpublished explicitly
- published links are visible on the public showroom only, not through a separate public detail page
- public link cards open the saved external URL in a new tab
- a link may also carry a cached favicon reference for owner/public card display

### Media
- uploaded note images are stored on a mounted filesystem path, not inside SQLite blobs
- cached link favicons are stored on that same mounted media path or a dedicated media subpath
- uploaded note images remain private until the note is published
- only images referenced by a published note should be publicly resolvable

### Tag
- tags are shared across notes and links
- tags are owner-facing organization primitives, not public taxonomy pages

## Publishing Rules
- publishing applies to both notes and links
- publishing does not expose the entire private vault
- public routes must exclude drafts, unpublished notes, and unpublished links by default
- the public homepage mixes published notes and published links in one showroom feed

## Retrieval Rules
- public search is homepage-only and title-only
- owner search is private and targets note titles, link titles, URLs, and tags
- future public full-text retrieval should be proposed as a separate feature wave instead of silently broadening the contract
- AI-generated metadata may improve display and tagging before retrieval expands into summary/body search
