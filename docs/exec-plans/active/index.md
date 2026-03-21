# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `021-ui-design-system-foundation.md` -> establish shared design tokens, reusable presentation primitives, and the cool monochrome studio base
2. `022-public-home-shell-reset.md` -> reduce hero dominance and reset the homepage around a note-first showroom structure
3. `023-public-home-dynamic-grid.md` -> implement the varied-height showroom grid and reusable note preview cards
4. `024-public-note-reading-polish.md` -> tighten public note reading hierarchy and metadata treatment
5. `025-owner-shell-density-reset.md` -> introduce a slimmer owner shell and denser desktop structure
6. `026-owner-dashboard-density.md` -> tighten dashboard list density and owner navigation hierarchy
7. `027-editor-and-form-density.md` -> compact the note editor, login, and owner form surfaces using reusable primitives
8. `028-secondary-owner-surface-pass.md` -> align links, tags, and search with the new design system and density rules
9. `029-mobile-responsive-polish.md` -> finish mobile-first responsive behavior across public and private surfaces
10. `030-ui-hardening-and-regression.md` -> reconcile consistency, responsive polish, and regression-proofing after the redesign

## Operating rule

A task may be promoted only when all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
