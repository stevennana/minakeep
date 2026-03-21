# FRONTEND.md

## Goal
Describe the user-facing structure of Minakeep so an agent can implement the UI without guessing the product model.

## Tech Direction
- Next.js application
- TypeScript
- App Router
- server-backed data flows where appropriate
- reusable presentational components layered above existing route and feature logic

## Route Map
- `/` -> public homepage showroom of published notes
- `/notes/[slug]` -> public published-note reading page
- `/login` -> owner sign-in
- `/app` -> private notes-first dashboard shell
- `/app/notes/new` -> create note
- `/app/notes/[id]/edit` -> edit note and preview markdown
- `/app/links` -> private saved-link management
- `/app/tags` -> shared-tag overview
- `/app/search` -> owner-only search and filtering

## Primary Screens
### Public homepage
Acts as a note showroom first. It should emphasize a dynamic grid of note previews with varied heights, compact metadata, and restrained framing.

### Public note page
Prioritizes reading comfort with narrower measure, clearer hierarchy, quieter metadata, and supporting AI summary/tags.

### Owner login
Simple credentials screen with reduced visual bulk and cleaner desktop/mobile balance.

### Private dashboard
Compact professional workspace with slimmer navigation, tighter lists, and more visible note content above the fold on desktop.

### Note editor and owner forms
Smaller typographic hierarchy, reduced padding, and reusable form/layout primitives without changing existing logic flows.

### Links, tags, and search
Secondary owner surfaces should inherit the same density and responsive behavior as the dashboard rather than looking like oversized standalone cards.

## UI Rules
- keep public reading calm, clear, and note-first
- use a cool monochrome studio palette rather than the current warm paper atmosphere
- keep headings materially smaller than the current implementation
- prefer a dynamic but controlled grid rhythm over rigid equal-height card walls
- keep the owner workspace compact and professional on desktop
- build reusable design primitives and CSS tokens so style changes do not require route-level logic edits
- make mobile layouts easy to scan and operate with one hand

## Search / Share / Admin Notes
- search remains owner-only
- tags remain shared across notes and links
- links remain private even when notes can be public
- publishing remains a note-level decision, not a site-wide mode switch
- AI metadata remains visible but visually secondary to authored content

## Frontend Non-Goals for v1
- public search UI
- rich-text editor tooling
- attachment/upload interfaces
- cloned Karakeep layout or branding
- route-specific one-off styling that bypasses the shared design system without strong reason
