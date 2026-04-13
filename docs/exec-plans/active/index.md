# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence

1. `103-markdown-reference-renderer-foundation.md` -> teach the shared note renderer the supported footnote-style reference syntax and extracted bottom-reference contract.
2. `104-reference-link-note-surfaces.md` -> ship the owner-preview and public-note reading experience for inline markers plus the bottom `References` section.
3. `105-reference-link-wave-hardening.md` -> close the wave with bundled regression replay, fallback verification, and queue/doc reconciliation.

Task `102` is already preserved in completed history as the final Mermaid expansion hardening step. This next wave is a separate markdown-reader feature front focused on footnote-style reference links, not an extension of Mermaid scope.

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
