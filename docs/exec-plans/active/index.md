# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `031-public-publishing-foundation.md` -> extend the public model from notes-only to mixed published notes and links with explicit publishing boundaries
2. `034-public-showroom-shell-cleanup.md` -> remove the owner-entrance side section and simplify the public chrome around the mixed feed
3. `035-public-showroom-title-search.md` -> add one unified title-only live search bar for the public showroom
4. `036-public-link-new-tab-behavior.md` -> make published link cards open the external destination in a new tab with safe public behavior
5. `037-ui-hierarchy-softening.md` -> tone down `h1` and `strong` emphasis across public and owner surfaces
6. `038-public-showroom-responsive-polish.md` -> keep the mixed showroom and title search clean on desktop and mobile
7. `039-public-publishing-regression-pass.md` -> verify mixed publishing, search, and public navigation together after the slice work lands
8. `040-public-wave-hardening.md` -> reconcile docs, reliability, and remaining debt after the new public wave lands

Tasks `032` and `033` were absorbed into `031-public-publishing-foundation` and moved to completed history once the shipped code and E2E coverage were reconciled with the queue.

## Operating rule

A task may be promoted only when all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
