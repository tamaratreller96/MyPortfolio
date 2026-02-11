import Database from 'better-sqlite3';
import path from 'path';

// Use an absolute path or relative to CWD. Since usually run from root.
const dbPath = path.resolve(process.cwd(), 'status.db');

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

export default db;
