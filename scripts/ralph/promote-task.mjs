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

const evaluationPath = path.join(process.cwd(), "state", "evaluation.json");
if (!fileExists(evaluationPath)) {
  console.log("No evaluation.json found; skipping promotion.");
  process.exit(0);
}

const evaluation = JSON.parse(readText(evaluationPath));
if (!evaluation.promotion_eligible) {
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

const completedMeta = {
  ...task.meta,
  status: "completed",
  completed_at: completedAt,
};

let completedMarkdown = replaceTaskMeta(task.markdown, completedMeta);
completedMarkdown = appendTaskProgressNote(
  completedMarkdown,
  `${completedAt}: automatically promoted after deterministic checks and evaluator approval.`,
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
const historyEntry = `- ${completedAt}: promoted ${task.id} -> ${nextTaskId ?? "NONE"}\n`;
fs.appendFileSync(historyPath, historyEntry, "utf8");

console.log(`Promoted ${task.id} -> ${nextTaskId ?? "NONE"}`);
