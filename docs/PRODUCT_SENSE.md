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
- a clean public showroom with one title-only search bar and a calmer, less aggressive hierarchy

## Non-Goals for v1
- multi-user collaboration or invite flows
- browser importers, automation rules, OCR, or content archiving
- AI chat or ask-your-vault conversations
- provider abstraction beyond the Mina-hosted OpenAI-compatible endpoint
- public full-text search or public link detail pages

## v1 Success Signals
- owners can publish notes and links into one coherent public showroom without exposing private content
- public visitors can find published items quickly through title-only search
- public links open externally in a new tab and behave like lightweight reference items
- the public hierarchy feels calmer, with less oversized `h1` and `strong` emphasis

## Product Risks
- mixed public content can become confusing if note and link cards are not differentiated clearly
- public search can feel noisy if title filtering is not immediate and predictable
- adding public links can accidentally leak private link states if publishing boundaries are not explicit
- toning down hierarchy can flatten the UI if not balanced carefully
