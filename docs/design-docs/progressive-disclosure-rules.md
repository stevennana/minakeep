# Progressive Disclosure Rules

## Goal
Keep Minakeep intuitive by removing redundant explanatory copy and reserving explicit help for the few places where it genuinely prevents confusion.

## Rules
- default to action-first surfaces, not explanation-first surfaces
- if a section title and control already make the action obvious, do not restate the obvious in nearby helper text
- do not surface internal implementation details such as environment seeding, storage, or route structure as user-facing copy
- do not repeat navigation destinations inside content panels when a stable sidebar or topbar already exposes them
- use compact helper text only where the consequence, scope, or boundary is not otherwise clear
- when help is needed but not always needed, prefer tooltip, details-reveal, or lightweight secondary affordances over full static panels

## Apply Strongly To
- owner dashboard intro and summary blocks
- owner note editor intro copy
- public search labels and helper text
- login supporting copy
- tags and search explainer panels

## Anti-Goals
- do not remove critical boundary cues such as private vs published visibility when those cues affect user trust
- do not replace every explanation with hidden UI; some concise inline guidance should remain where it prevents errors
