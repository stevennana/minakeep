# PRODUCT_SENSE.md

## One-Line Product Definition
Minakeep is a self-hosted knowledge vault for private markdown notes and saved links, with selectively published public notes, automatic AI enrichment, and a polished knowledge-studio interface.

## Who It Is For
### Primary user
A single owner who wants one durable place to capture private notes and bookmarks, then selectively publish polished notes for public reading.

## User Problem
Existing tools either optimize for public writing or for private capture, but not both in a simple self-hosted workflow. The owner wants one small system for drafting notes, saving links, organizing both, enriching them automatically, and publishing only chosen notes.

## Why This Product Exists
A scoped Karakeep-inspired product can deliver the useful core without dragging in collaboration, importers, OCR, or crawler infrastructure, while still adding AI metadata generation and a stronger visual identity.

## Product Principles
- keep the owner’s writing and capture flow fast even when AI enrichment is present
- treat AI summary and tags as generated metadata, not as a replacement for authored note content
- refresh the whole app with a coherent knowledge-studio visual system instead of bolting polish onto one screen
- preserve small-product discipline: no chat agent, no collaboration, no crawler platform in this wave

## Core Value in v1
- one place for private note and link capture
- automatic AI-generated summary and tags after save
- selective public note publishing without exposing the private vault
- a reference-close but distinct premium UI across public and private surfaces

## Non-Goals for v1
- multi-user collaboration or invite flows
- browser importers, automation rules, OCR, or content archiving
- AI chat or ask-your-vault conversations
- provider abstraction beyond the Mina-hosted OpenAI-compatible endpoint
- public link publishing or anonymous search

## v1 Success Signals
- owners can save notes and links without waiting for AI success, while still seeing useful generated metadata most of the time
- generated AI summary and tags materially improve private retrieval and public note previews
- the refreshed UI feels visually competitive with the reference product while keeping Minakeep’s own layout and identity
- AI tasks remain promotion-gated by real-endpoint E2E instead of mock-only confidence

## Product Risks
- AI enrichment can slow or clutter the save flow if failure states are not designed carefully
- generated tags can feel low-trust if retry behavior and visible status are vague
- a full-app redesign can regress density or clarity if it chases aesthetics without preserving the vault workflow
- the external endpoint contract can drift if env handling and real-endpoint E2E are not kept explicit
