import path from "node:path";

export function resolveTestDatabaseUrl(rawUrl: string | undefined) {
  if (!rawUrl) {
    return rawUrl;
  }

  if (!rawUrl.startsWith("file:")) {
    return rawUrl;
  }

  const sqlitePath = rawUrl.slice("file:".length);
  const queryIndex = sqlitePath.indexOf("?");
  const pathname = queryIndex === -1 ? sqlitePath : sqlitePath.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : sqlitePath.slice(queryIndex);

  if (!pathname.startsWith("./") && !pathname.startsWith("../")) {
    return rawUrl;
  }

  return `file:${path.resolve(process.cwd(), pathname)}${search}`;
}
