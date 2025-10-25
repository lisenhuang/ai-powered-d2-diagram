import { createHash } from "crypto";
import type { DiagramFormat } from "./validation";

type CacheTheme = "light" | "dark";

export type DiagramCacheEntry = {
  buffer: Buffer;
  mimeType: string;
  format: DiagramFormat;
  createdAt: number;
  bytes: number;
};

const MAX_CACHE_ITEMS = 25;
const cache = new Map<string, DiagramCacheEntry>();

export function makeCacheKey(params: {
  code: string;
  format: DiagramFormat;
  theme: CacheTheme;
}) {
  const hash = createHash("sha256")
    .update(params.code)
    .update(params.format)
    .update(params.theme)
    .digest("hex");

  return hash;
}

export function getCachedDiagram(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry;
}

export function setCachedDiagram(key: string, entry: DiagramCacheEntry) {
  if (cache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = [...cache.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt,
    )[0]?.[0];
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, entry);
}
