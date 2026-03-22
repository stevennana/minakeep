# PRODUCT_SENSE.md

## One-Line Product Definition
Minakeep is a self-hosted knowledge vault for private markdown notes and saved links, with selectively published public notes and links, automatic AI enrichment, and a polished knowledge-studio interface.

## Who It Is For
### Primary user
A single owner who wants one durable place to capture private notes and bookmarks, then selectively publish polished notes or reference links for public reading.

## User Problem
Existing tools either optimize for public writing or for private capture, but not both in a simple self-hosted workflow. The owner wants one system for drafting notes, saving links, organizing both, enriching them automatically, and publishing chosen items to a public showroom without opening the entire vault.

## Why This Product Exists
A scoped Karakeep-inspired product can deliver the useful core without dragging in collaboration, importers, OCR, or crawler infrastructure, while still adding AI metadata generation and a stronger visual identity.

## Product Principles
- keep the owner’s writing and capture flow fast even when AI enrichment is present
- treat AI summary and tags as generated metadata, not as a replacement for authored note content
- keep the public showroom useful for both reading and reference discovery
- preserve small-product discipline: no chat agent, no collaboration, no crawler platform in this wave

## Core Value in v1
- one place for private note and link capture
- automatic AI-generated summary and tags after save
- selective public publishing for both notes and links
- a clean public showroom that exposes real published items in the first screen, with optional title-only search kept compact until needed and a calmer, less aggressive hierarchy
- a more human-made public surface whose topbar and search chrome recede behind the published content instead of competing with it
- a masonry-style public archive that feels dynamic on desktop without losing mobile clarity
- a stronger markdown authoring workbench that keeps markdown as the source of truth while making writing faster and easier
- image-rich notes with uploadable markdown images and cached link favicons that improve list-card scanning
- a documented Docker deployment path with mounted data and env-driven runtime configuration

## Non-Goals for v1
- multi-user collaboration or invite flows
- browser importers, automation rules, OCR, or content archiving
- AI chat or ask-your-vault conversations
- provider abstraction beyond the Mina-hosted OpenAI-compatible endpoint
- public full-text search or public link detail pages
- Notion-style rich-text document storage or collaborative block editing
- object-storage integration or generalized arbitrary attachment management

## v1 Success Signals
- owners can publish notes and links into one coherent public showroom without exposing private content
- public visitors can find published items quickly through title-only search
- the public homepage shows real showroom content in the first screen instead of spending that space on explanatory chrome
- public visitors encounter a bespoke-looking published surface instead of a generic AI-generated card grid
- desktop public pages feel content-led through masonry rhythm, quieter chrome, and calmer typography
- public links open externally in a new tab and behave like lightweight reference items
- the public hierarchy feels calmer, with less oversized `h1` and `strong` emphasis
- public tag chips size to their content cleanly without text spilling past the chip background
- owners can draft longer notes comfortably using source-first markdown editing, preview modes, and compact authoring aids
- owners can upload note images once and see them across editor, owner lists, and published note surfaces
- operators can run the app through a documented Docker image plus Compose path with mounted DB, media, logs, and env config

## Product Risks
- mixed public content can become confusing if note and link cards are not differentiated clearly
- public search can feel noisy if title filtering is not immediate and predictable, or too hidden when collapsed
- a masonry archive can become visually chaotic if the desktop layout uses too many columns or treats bookmark cards like image tiles
- adding public links can accidentally leak private link states if publishing boundaries are not explicit
- toning down hierarchy can flatten the UI if not balanced carefully
- pushing too much styling into topbars, pills, or decorative panels can pull attention away from the published content again
- a richer editor can accidentally break markdown fidelity or overload the note workflow if it behaves like a second document model
- uploaded media can weaken the private-vault model if image visibility does not stay aligned with note publish state
- favicon fetching can add network fragility unless failure paths fall back cleanly and cached assets stay bounded
