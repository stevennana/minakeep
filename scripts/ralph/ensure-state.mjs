import path from "node:path";
import {
  GENERATED_DIR,
  STATE_DIR,
  ensureDir,
  fileExists,
  getFirstQueuedOrActiveTask,
  readCurrentTaskId,
  writeCurrentTaskId,
  writeText,
} from "./lib/task-utils.mjs";

ensureDir(STATE_DIR);
ensureDir(GENERATED_DIR);
ensureDir(path.join(STATE_DIR, "artifacts"));

const currentTaskId = readCurrentTaskId();
if (!currentTaskId) {
  const firstTask = getFirstQueuedOrActiveTask();
  if (firstTask) {
    writeCurrentTaskId(firstTask.id);
  } else {
    writeText(path.join(STATE_DIR, "current-task.txt"), "NONE\n");
  }
}

const defaults = [
  ["run-log.md", "# Ralph Loop Run Log\n"],
  ["task-history.md", "# Task History\n\n"],
  ["last-result.txt", ""],
  ["evaluation.json", '{\n  "status": "not_run"\n}\n'],
  ["current-cycle.json", '{\n  "status": "idle"\n}\n'],
  ["backlog.md", "# Backlog\n\n"],
];

for (const [name, content] of defaults) {
  const fullPath = path.join(STATE_DIR, name);
  if (!fileExists(fullPath)) {
    writeText(fullPath, content);
  }
}
