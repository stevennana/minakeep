import path from "node:path";
import {
  GENERATED_DIR,
  extractSection,
  findTaskDoc,
  readCurrentTaskId,
  safeJsonParse,
  writeText,
  fileExists,
  readText,
} from "./lib/task-utils.mjs";

const taskId = readCurrentTaskId();
if (!taskId || taskId === "NONE") {
  throw new Error("No current task is configured.");
}

const task = findTaskDoc(taskId);
if (!task) {
  throw new Error(`Active task '${taskId}' not found.`);
}

let priorEvaluation = null;
const evalPath = path.join(process.cwd(), "state", "evaluation.json");
if (fileExists(evalPath)) {
  priorEvaluation = safeJsonParse(readText(evalPath), null);
}

const objective = extractSection(task.markdown, "Objective");
const scope = extractSection(task.markdown, "Scope");
const outOfScope = extractSection(task.markdown, "Out of scope");
const exitCriteria = extractSection(task.markdown, "Exit criteria");
const requiredChecks = extractSection(task.markdown, "Required checks");
const evaluatorNotes = extractSection(task.markdown, "Evaluator notes");

const priorGaps =
  priorEvaluation && Array.isArray(priorEvaluation?.llm?.missing_requirements)
    ? priorEvaluation.llm.missing_requirements
    : [];

const docsToRead = Array.from(new Set(task.meta.prompt_docs ?? []));

const prompt = `
Read the following repository documents before making changes:
${docsToRead.map((doc) => `- ${doc}`).join("\n")}
- ${task.filePath.replace(`${process.cwd()}/`, "")}

Current task id: ${task.id}
Current task title: ${task.meta.title}

Objective:
${objective}

Scope:
${scope}

Out of scope:
${outOfScope}

Exit criteria:
${exitCriteria}

Required checks:
${requiredChecks}

Evaluator notes:
${evaluatorNotes}

Required repository artifacts for this task:
${(task.meta.required_files ?? []).map((file) => `- ${file}`).join("\n") || "- none"}

Required commands for this task:
${(task.meta.required_commands ?? []).map((cmd) => `- ${cmd}`).join("\n") || "- npm run verify"}

Previous known gaps from the last evaluation:
${priorGaps.length ? priorGaps.map((gap) => `- ${gap}`).join("\n") : "- none"}

Rules:
- Work only on this task.
- Do not broaden scope.
- Keep the existing package manager.
- Preserve repository abstractions.
- Keep changes deterministic and minimal.
- Update this task doc's progress log with concrete notes.
- Keep the repository in a state where the required commands can pass.
- If the task is not done, leave the next task untouched.

At the end of the run, write a concise operator handoff summary into state/last-result.txt via your final response:
- what changed
- whether the exit criteria appear satisfied
- what remains if the task is still incomplete
`.trim();

const outputPath = path.join(GENERATED_DIR, "current-task-prompt.txt");
writeText(outputPath, `${prompt}\n`);
console.log(outputPath);
