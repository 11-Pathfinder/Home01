/**
 * Initialize the SQLite database with the schema.
 * Run: npx tsx scripts/00-init-db.ts
 */
import { getScriptDb, initSchema } from "./utils/db";

const db = getScriptDb();
initSchema(db);
db.close();
console.log("Database initialized at homescope.db");
