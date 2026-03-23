# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `080-site-settings-foundation.md` -> define the persisted settings model, route ownership, and site-wide branding contract
2. `081-site-settings-ui.md` -> expose the owner settings surface for title/description editing and shell-level branding reads
3. `082-public-showroom-clickable-media.md` -> make published note and link preview images use the same destinations as their titles
4. `083-public-note-reading-top-summary.md` -> move AI summary/tags above the note body and tighten public-note title fit
5. `084-owner-content-deletion.md` -> add permanent delete for unpublished notes and links with explicit confirmation
6. `085-self-host-upgrade-safety.md` -> add upgrade-safe schema-change handling and automatic SQLite backup for self-host/Docker paths
7. `086-next-wave-hardening.md` -> align docs and regression coverage across the full wave

Tasks `077` through `079` are preserved in completed history as the finished external-note-api tranche. Earlier completed tranches remain preserved as history.

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
