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
- `/` -> public showroom of published notes and published links
- `/notes/[slug]` -> public published-note reading page
- `/login` -> owner sign-in
- `/app` -> private notes-first dashboard shell
- `/app/notes/new` -> create note
- `/app/notes/[id]/edit` -> edit note and preview markdown
- `/app/links` -> private saved-link management with publish controls
- `/app/tags` -> shared-tag overview
- `/app/search` -> owner-only search and filtering

## Primary Screens
### Public homepage
Acts as a mixed public showroom first. It should emphasize a dynamic grid of published note and published link previews, remove the old owner-entrance side section, keep framing copy minimal, and keep the public title-only search control collapsed by default until the visitor explicitly expands it.

### Public note page
Prioritizes reading comfort with narrower measure, clearer hierarchy, quieter metadata, and supporting AI summary/tags.

### Published link cards
Appear in the public showroom alongside note cards, with title, summary, and tags, and open the external destination in a new tab.

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
- the public homepage no longer needs a separate “Owner entrance” or “Private origin” section
- use one unified title-only public search bar without a type selector
- keep the public search control compact or collapsed on first load so the showroom remains visible in the first screen
- do not spend first-screen space on multi-paragraph explanatory copy above the public showroom
- published link cards should look related to note cards but remain visibly distinguishable as links
- tone down `h1` scale and `strong` emphasis across public and owner surfaces without flattening hierarchy
- keep the owner workspace compact and professional on desktop
- build reusable design primitives and CSS tokens so style changes do not require route-level logic edits
- make mobile layouts easy to scan and operate with one hand

## Search / Share / Admin Notes
- public search is homepage-only and title-only
- the public search affordance is collapsed or compact by default and expands only on explicit user action
- owner search remains private
- tags remain shared across notes and links
- publishing is a per-item decision for both notes and links
- published links open the saved destination in a new tab
- AI metadata remains visible but visually secondary to authored content

## Frontend Non-Goals for v1
- public search filters by type
- public full-text search over summaries or note bodies
- public link detail pages
- rich-text editor tooling
- attachment/upload interfaces
- cloned Karakeep layout or branding
