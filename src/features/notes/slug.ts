function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function createNoteSlug(title: string) {
  const normalized = normalizeWhitespace(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled-note";
}

export function createUniqueNoteSlug(title: string, existingSlugs: Iterable<string>) {
  const baseSlug = createNoteSlug(title);
  const taken = new Set(existingSlugs);

  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (taken.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}
