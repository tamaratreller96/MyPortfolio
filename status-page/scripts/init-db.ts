import db from '../lib/db';

const schema = `
  DROP TABLE IF EXISTS components;
  DROP TABLE IF EXISTS incidents;
  DROP TABLE IF EXISTS maintenances;
  DROP TABLE IF EXISTS sync_logs;

  CREATE TABLE components (
    id TEXT PRIMARY KEY,
    componentId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    group_name TEXT,
    updatedAt TEXT NOT NULL,
    syncedAt TEXT NOT NULL
  );

  CREATE TABLE incidents (
    id TEXT PRIMARY KEY,
    incidentId TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    body TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    syncedAt TEXT NOT NULL
  );

  CREATE TABLE maintenances (
    id TEXT PRIMARY KEY,
    maintenanceId TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    scheduledStart TEXT NOT NULL,
    scheduledEnd TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    syncedAt TEXT NOT NULL
  );

  CREATE TABLE sync_logs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    message TEXT,
    durationMs INTEGER,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

function init() {
  console.log('Initializing database...');
  db.exec(schema);
  console.log('Database initialized successfully.');
}

init();
