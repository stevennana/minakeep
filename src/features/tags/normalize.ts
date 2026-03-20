export function normalizeTagNames(tags: string) {
  return Array.from(
    new Set(
      tags
        .split(/[\n,]/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));
}

export function normalizeSingleTagName(tag: string | undefined) {
  if (!tag) {
    return null;
  }

  return normalizeTagNames(tag)[0] ?? null;
}
