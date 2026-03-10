import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "homescope.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

/**
 * Get a writable database connection for data pipeline scripts.
 */
export function getScriptDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("cache_size = -64000");
  db.pragma("synchronous = NORMAL");
  return db;
}

/**
 * Initialize the database with the schema.
 */
export function initSchema(db: Database.Database): void {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  console.log("Schema initialized.");
}
