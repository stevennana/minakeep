export const PUBLIC_COLLECTION_PAGE_SIZE = 10;
export const OWNER_COLLECTION_PAGE_SIZE = 20;
export const MAX_INCREMENTAL_COLLECTION_SIZE = 200;

export function normalizeIncrementalLimit(value: string | undefined, defaultLimit: number) {
  if (!value) {
    return defaultLimit;
  }

  const parsedLimit = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedLimit)) {
    return defaultLimit;
  }

  return Math.min(MAX_INCREMENTAL_COLLECTION_SIZE, Math.max(defaultLimit, parsedLimit));
}

export function getNextIncrementalLimit(currentLimit: number, totalCount: number, pageSize: number) {
  return Math.min(totalCount, currentLimit + pageSize);
}
