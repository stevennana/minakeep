import fs from "node:fs";
import path from "node:path";

export const REPO_ROOT = process.cwd();
export const ACTIVE_TASK_DIR = path.join(REPO_ROOT, "docs", "exec-plans", "active");
export const COMPLETED_TASK_DIR = path.join(REPO_ROOT, "docs", "exec-plans", "completed");
export const STATE_DIR = path.join(REPO_ROOT, "state");
export const GENERATED_DIR = path.join(REPO_ROOT, "scripts", "ralph", "generated");

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function timestamp() {
  return new Date().toISOString();
}

export function normalizeTaskId(raw) {
  return String(raw).trim().replace(/\.md$/, "");
}

export function readCurrentTaskId() {
  const filePath = path.join(STATE_DIR, "current-task.txt");
  if (!fileExists(filePath)) return null;
  const value = normalizeTaskId(readText(filePath));
  return value.length > 0 ? value : null;
}

export function writeCurrentTaskId(taskId) {
  writeText(path.join(STATE_DIR, "current-task.txt"), `${normalizeTaskId(taskId)}\n`);
}

export function extractTaskMeta(markdown) {
  const match = markdown.match(/```json taskmeta\s*([\s\S]*?)```/);
  if (!match) return null;
  return JSON.parse(match[1].trim());
}

export function replaceTaskMeta(markdown, nextMeta) {
  const serialized = JSON.stringify(nextMeta, null, 2);
  return markdown.replace(
    /```json taskmeta\s*[\s\S]*?```/,
    `\`\`\`json taskmeta\n${serialized}\n\`\`\``
  );
}

export function listTaskDocs(dirPath = ACTIVE_TASK_DIR) {
  if (!fileExists(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const docs = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const fullPath = path.join(dirPath, entry.name);
    const markdown = readText(fullPath);
    const meta = extractTaskMeta(markdown);
    if (!meta) continue;
    docs.push({
      id: normalizeTaskId(meta.id ?? entry.name),
      fileName: entry.name,
      filePath: fullPath,
      markdown,
      meta,
    });
  }
  return docs.sort((a, b) => {
    const ao = a.meta.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.meta.order ?? Number.MAX_SAFE_INTEGER;
    return ao - bo || a.fileName.localeCompare(b.fileName);
  });
}

export function findTaskDoc(taskId, dirPath = ACTIVE_TASK_DIR) {
  const normalized = normalizeTaskId(taskId);
  return listTaskDocs(dirPath).find((task) => task.id === normalized) ?? null;
}

export function getFirstQueuedOrActiveTask() {
  const tasks = listTaskDocs();
  return tasks.find((task) => ["active", "queued"].includes(task.meta.status)) ?? null;
}

export function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m");
  const match = markdown.match(regex);
  return match ? match[1].trim() : "";
}

export function appendTaskProgressNote(markdown, noteLine) {
  const marker = "## Progress log";
  if (!markdown.includes(marker)) return `${markdown.trim()}\n\n## Progress log\n\n- ${noteLine}\n`;
  return markdown.replace(
    /## Progress log\s*([\s\S]*)$/,
    (_whole, tail) => `${marker}\n\n${tail.trim()}\n- ${noteLine}\n`
  );
}

export function renderBacklogMarkdown(tasks, currentTaskId) {
  const lines = ["# Backlog", ""];
  for (const task of tasks) {
    const isCurrent = normalizeTaskId(task.id) === normalizeTaskId(currentTaskId);
    const marker = task.meta.status === "completed" ? "x" : " ";
    const currentTag = isCurrent ? " ← current" : "";
    lines.push(`- [${marker}] ${task.id} — ${task.meta.title}${currentTag}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
