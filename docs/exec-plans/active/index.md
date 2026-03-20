# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `011-note-authoring.md` -> Let the owner sign in, create draft markdown notes, edit them, and preview the rendered result inside the private Minakeep area.
2. `012-public-note-publishing.md` -> Let the owner publish or unpublish a note and expose published notes on the public homepage and note pages.
3. `013-link-capture.md` -> Let the owner save private links with a manual title, summary, and shared tags inside Minakeep.
4. `014-tag-filtering-and-owner-search.md` -> Let the owner organize notes and links with shared tags and basic owner-only search over titles, URLs, and tags.
5. `015-hardening-and-maintenance.md` -> Close the reliability, security, and automation gaps after the minakeep feature slices land.

## Operating rule

A task may be promoted only when all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
