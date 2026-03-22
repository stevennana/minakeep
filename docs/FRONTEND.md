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
- media delivery should use server-backed URLs that respect owner/private and published/public boundaries

## Primary Screens
### Public homepage
Acts as a mixed public showroom first. It should emphasize a dynamic masonry-style archive of published note and published link previews, remove the old owner-entrance side section, keep framing copy minimal, use a compact archive header instead of a hero block, and keep the public title-only search control collapsed into a small button-and-summary row until the visitor explicitly expands it.

### Public note page
Prioritizes reading comfort with narrower measure, calmer human-made typography, quieter metadata, uploaded note images, and supporting AI summary/tags.

### Published link cards
Appear in the public showroom alongside note cards, with a cached favicon head image, title, summary, and tags, and open the external destination in a new tab.

### Owner login
Simple credentials screen with reduced visual bulk and cleaner desktop/mobile balance.

### Private dashboard
Compact professional workspace with slimmer navigation, tighter lists, and more visible note content above the fold on desktop. Secondary route-promoting blocks should not steal prime desktop width from the Notes section.

### Note editor and owner forms
Smaller typographic hierarchy, reduced padding, and reusable form/layout primitives without changing existing logic flows. The note editor should evolve into a source-first markdown workbench with syntax-aware editing, a compact formatting toolbar, `Source / Split / Preview` modes on desktop, a cleaner `Edit / Preview` toggle on mobile, and an upload path that inserts note images into markdown automatically.

### Links, tags, and search
Secondary owner surfaces should inherit the same density and responsive behavior as the dashboard rather than looking like oversized standalone cards.

## UI Rules
- keep public reading calm, clear, and note-first
- make the published content visually dominant; topbar chrome, archive counters, and search affordances should feel recessive
- the public homepage no longer needs a separate “Owner entrance” or “Private origin” section
- use one unified title-only public search bar without a type selector
- keep the public search control compact or collapsed on first load so the showroom remains visible in the first screen
- when expanded, the public search panel should sit on its own row beneath the archive header rather than as a competing right-side tile beside the archive count
- do not spend first-screen space on multi-paragraph explanatory copy above the public showroom
- prefer a masonry-style desktop archive with 3 to 4 columns depending on width, then fall back aggressively to 2 columns on tablet and 1 column on narrow mobile
- if masonry behavior is implemented with CSS multi-columns, child cards must use `break-inside: avoid` and mobile must collapse back to a strict ordered stack
- published link cards should look related to note cards but remain visibly distinguishable as links
- published note cards may use the first embedded note image as their head image
- link cards should use cached favicons when available instead of depending on third-party icon URLs at render time
- tone down `h1` scale and `strong` emphasis across public and owner surfaces without flattening hierarchy
- avoid generic “AI slop” signatures such as oversized centered heroes, equal three-card marketing rows, glowing accent treatments, or interchangeable SaaS panel chrome
- tags must size to content cleanly, allow long names to wrap or clamp safely, and never let text spill outside the chip background
- prefer premium sans typography for public surfaces over generic system-feel headings; the public site should feel bespoke without drifting into ornamental serif theatrics
- keep the owner workspace compact and professional on desktop
- on the owner dashboard, prioritize the Notes section over route-promotion tiles or owner-tool explainer panels
- build reusable design primitives and CSS tokens so style changes do not require route-level logic edits
- make mobile layouts easy to scan and operate with one hand
- keep note authoring markdown-native; richer editor controls should still save one markdown string, not a separate rich-text document model

## Search / Share / Admin Notes
- public search is homepage-only and title-only
- the public search affordance is collapsed or compact by default, shows title-only scope in its collapsed state, and expands only on explicit user action
- closing the expanded public search returns to the collapsed state and clears the active query
- owner search remains private
- tags remain shared across notes and links
- publishing is a per-item decision for both notes and links
- published links open the saved destination in a new tab
- AI metadata remains visible but visually secondary to authored content
- uploaded note images remain owner-visible immediately but should reach public routes only through published-note surfaces

## Frontend Non-Goals for v1
- public search filters by type
- public full-text search over summaries or note bodies
- public link detail pages
- rich-text editor tooling
- arbitrary attachment/upload interfaces beyond note-image uploads
- cloned Karakeep layout or branding
