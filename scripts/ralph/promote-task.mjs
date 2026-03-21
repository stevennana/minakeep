import fs from "node:fs";
import path from "node:path";
import {
  ACTIVE_TASK_DIR,
  COMPLETED_TASK_DIR,
  appendTaskProgressNote,
  findTaskDoc,
  readCurrentTaskId,
  readText,
  replaceTaskMeta,
  timestamp,
  writeCurrentTaskId,
  writeText,
  fileExists,
  ensureDir,
} from "./lib/task-utils.mjs";

const DEFAULT_MANUAL_PROMOTION_REASON = "operator manual promotion";

function parseArgs(argv) {
  const parsed = {
    manual: false,
    reason: DEFAULT_MANUAL_PROMOTION_REASON,
    artifact: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--manual") {
      parsed.manual = true;
      continue;
    }
    if (arg === "--reason") {
      parsed.reason = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--artifact") {
      parsed.artifact = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

const options = parseArgs(process.argv.slice(2));
const evaluationPath = path.join(process.cwd(), "state", "evaluation.json");
if (!options.manual && !fileExists(evaluationPath)) {
  console.log("No evaluation.json found; skipping promotion.");
  process.exit(0);
}

const evaluation = fileExists(evaluationPath) ? JSON.parse(readText(evaluationPath)) : null;
if (!options.manual && !evaluation?.promotion_eligible) {
  console.log(`Task ${evaluation.task_id ?? "(unknown)"} not eligible for promotion.`);
  process.exit(0);
}

const currentTaskId = readCurrentTaskId();
const task = findTaskDoc(currentTaskId);
if (!task) {
  console.log(`Current task ${currentTaskId} not found; skipping promotion.`);
  process.exit(0);
}

const completedAt = timestamp();
const nextTaskId = task.meta.next_task_on_success ?? null;
const overrideArtifact = options.artifact.trim();
const manualOverride = options.manual
  ? {
      reason: options.reason.trim() || DEFAULT_MANUAL_PROMOTION_REASON,
      artifact: overrideArtifact || null,
      previous_evaluation_status: evaluation?.status ?? null,
      promoted_at: completedAt,
    }
  : null;

const completedMeta = {
  ...task.meta,
  status: "completed",
  completed_at: completedAt,
  ...(manualOverride ? { manual_override: manualOverride } : {}),
};

let completedMarkdown = replaceTaskMeta(task.markdown, completedMeta);
completedMarkdown = appendTaskProgressNote(
  completedMarkdown,
  manualOverride
    ? `${completedAt}: manually promoted by operator override. Reason: ${manualOverride.reason}${manualOverride.artifact ? ` Artifact: ${manualOverride.artifact}.` : ""}`
    : `${completedAt}: automatically promoted after deterministic checks and evaluator approval.`,
);

ensureDir(COMPLETED_TASK_DIR);
const completedPath = path.join(COMPLETED_TASK_DIR, path.basename(task.filePath));
writeText(completedPath, completedMarkdown);
fs.unlinkSync(task.filePath);

if (nextTaskId) {
  writeCurrentTaskId(nextTaskId);
  const nextTaskPath = path.join(ACTIVE_TASK_DIR, `${nextTaskId}.md`);
  if (fileExists(nextTaskPath)) {
    const nextMarkdown = readText(nextTaskPath);
    const match = nextMarkdown.match(/```json taskmeta\s*([\s\S]*?)```/);
    if (match) {
      const nextMeta = JSON.parse(match[1].trim());
      if (nextMeta.status !== "completed") {
        nextMeta.status = "active";
        writeText(nextTaskPath, replaceTaskMeta(nextMarkdown, nextMeta));
      }
    }
  }
} else {
  writeCurrentTaskId("NONE");
}

const historyPath = path.join(process.cwd(), "state", "task-history.md");
const historyEntry = manualOverride
  ? `- ${completedAt}: manually promoted ${task.id} -> ${nextTaskId ?? "NONE"} | reason=${manualOverride.reason}${manualOverride.artifact ? ` | artifact=${manualOverride.artifact}` : ""}\n`
  : `- ${completedAt}: promoted ${task.id} -> ${nextTaskId ?? "NONE"}\n`;
fs.appendFileSync(historyPath, historyEntry, "utf8");

if (manualOverride) {
  const manualEvaluation = {
    checked_at: completedAt,
    task_id: task.id,
    status: "done",
    promotion_eligible: true,
    deterministic: evaluation?.deterministic ?? null,
    llm: evaluation?.llm ?? null,
    summary: `Task manually promoted by operator override. Reason: ${manualOverride.reason}`,
    missing_requirements: evaluation?.missing_requirements ?? [],
    manual_override: manualOverride,
  };
  writeText(evaluationPath, JSON.stringify(manualEvaluation, null, 2));
}

console.log(
  manualOverride
    ? `Manually promoted ${task.id} -> ${nextTaskId ?? "NONE"}`
    : `Promoted ${task.id} -> ${nextTaskId ?? "NONE"}`
);
