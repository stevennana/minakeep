# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `056-public-surface-taste-foundation.md` -> establish the content-first public visual foundation, shared primitives, and calmer typography rules
2. `057-public-showroom-masonry-reset.md` -> rebuild the public showroom around a masonry-style archive with quieter chrome
3. `058-public-note-human-reading-polish.md` -> refine the public note page hierarchy, rhythm, and bespoke reading presentation
4. `059-tag-chip-and-public-type-fit.md` -> fix tag-chip sizing and tone down public heading/strong emphasis across the public surfaces
5. `060-public-surface-hardening.md` -> reconcile docs, responsive behavior, screenshots, and regression coverage for the new public wave

Tasks `045` through `055` are preserved in completed history as the completed markdown-editor, media, and container tranches.

## Operating rule

A task may be promoted only when its task contract rules are satisfied.

For standard tasks, that means all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

For tasks with `"promotion_mode": "deterministic_only"`, evaluator narrative is not required. Those tasks promote only when their required deterministic checks pass and the evaluation state marks them promotion-eligible.

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
