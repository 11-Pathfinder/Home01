import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "homescope.db");

    // If the database doesn't exist, create it with the schema
    if (!fs.existsSync(dbPath)) {
      const schemaPath = path.join(process.cwd(), "db", "schema.sql");
      const initDb = new Database(dbPath);
      initDb.pragma("journal_mode = WAL");
      if (fs.existsSync(schemaPath)) {
        initDb.exec(fs.readFileSync(schemaPath, "utf-8"));
      }
      initDb.close();
    }

    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
    db.pragma("cache_size = -64000"); // 64MB cache
  }
  return db;
}

/** Writable connection for scripts only */
export function getWritableDb(): Database.Database {
  const dbPath = path.join(process.cwd(), "homescope.db");
  const conn = new Database(dbPath);
  conn.pragma("journal_mode = WAL");
  conn.pragma("cache_size = -64000");
  return conn;
}
