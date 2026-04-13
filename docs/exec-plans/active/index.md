# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence

1. `106-image-loading-priority-foundation.md` -> replace the current always-lazy image defaults with one shared loading-intent contract for note cards, favicons, and rendered markdown images.
2. `107-first-screen-card-media-priority.md` -> apply the contract to the public showroom plus owner dashboard and links surfaces so visible card media loads before lower-list media.
3. `108-image-loading-wave-hardening.md` -> close the wave by extending the contract to rendered note-body images and bundling regression coverage for the shipped viewport-first loading behavior.

Task `105` is already preserved in completed history as the reference-link closeout. This next wave is a separate cross-surface media-loading pass focused on viewport-first image delivery, not a continuation of markdown reference rendering.

## Operating rule

A task may be promoted only when its task contract rules are satisfied.

For standard tasks, that means all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

For tasks with `"promotion_mode": "deterministic_only"`, evaluator narrative is not required. Those tasks promote only when their required deterministic checks pass and the evaluation state marks them promotion-eligible.

## When this queue ends

When the image-loading wave closes, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
