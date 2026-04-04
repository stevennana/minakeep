# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence

1. `092-mermaid-renderer-foundation.md` -> extend the shared note-markdown pipeline to recognize Mermaid fences and fail soft without changing stored markdown.
2. `093-public-mermaid-note-surfaces.md` -> render Mermaid diagrams on published note pages through the shared note-reading path.
3. `094-editor-mermaid-preview.md` -> bring the same Mermaid rendering contract into the owner workbench preview on desktop and mobile.
4. `095-mermaid-wave-hardening.md` -> close the Mermaid tranche with regression coverage, queue alignment, and deterministic replay.

Task `091` is preserved in completed history as the note-math verification tranche. This active queue starts the Mermaid markdown wave with a shared-renderer foundation task, then splits public note reading, editor preview, and hardening into separate promotion slices. The homepage remains excerpt and summary based in this wave; Mermaid support reaches only the surfaces that already render note markdown.

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
