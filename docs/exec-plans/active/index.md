# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `050-media-storage-foundation.md` -> introduce mounted media storage, upload metadata, and publish-gated serving rules
2. `051-note-image-upload-and-embed.md` -> let owners upload note images and insert markdown references automatically
3. `052-note-image-display-and-publish.md` -> derive the first markdown image for note cards and enforce public visibility only after publish
4. `053-link-favicon-cache-and-render.md` -> fetch and cache favicons locally for owner and public link cards
5. `054-docker-packaging-and-compose.md` -> ship a Docker image plus Compose path with mounted DB, media, logs, and env config
6. `055-media-and-container-hardening.md` -> reconcile docs, security, reliability, and regression coverage after the media and container wave

Tasks `045` through `049` are preserved in completed history as the completed markdown-editor tranche.

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
