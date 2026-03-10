import { getDb } from "./db";

/**
 * SQLite-backed API response cache.
 * Used to cache external API calls (Police, TfL, flood risk) to avoid
 * hitting rate limits and improve response times.
 */
export function getCached(key: string): string | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT response FROM api_cache
       WHERE cache_key = ? AND (created_at + ttl_seconds) > unixepoch()`
    )
    .get(key) as { response: string } | undefined;
  return row?.response ?? null;
}

export function setCache(key: string, response: string, ttlSeconds = 86400): void {
  const db = getDb();
  // Use a writable connection for cache writes
  // In the app, the main db is readonly, so we need a separate connection
  const Database = require("better-sqlite3");
  const path = require("path");
  const dbPath = path.join(process.cwd(), "homescope.db");
  const writeDb = new Database(dbPath);
  writeDb
    .prepare(
      `INSERT OR REPLACE INTO api_cache (cache_key, response, created_at, ttl_seconds)
       VALUES (?, ?, unixepoch(), ?)`
    )
    .run(key, response, ttlSeconds);
  writeDb.close();
}
