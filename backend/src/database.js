import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'storage.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function initDb() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function execQuery(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function initializeDatabase() {
  await initDb();

  await execQuery('PRAGMA foreign_keys = ON');

  // Create tables
  await execQuery(`
    CREATE TABLE IF NOT EXISTS storages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      category TEXT DEFAULT 'vegetables',
      rawMaterial TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storage_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      unit TEXT,
      image TEXT,
      expiration_date DATE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (storage_id) REFERENCES storages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT
    );
  `);

  // Add rawMaterial column if it doesn't exist (for existing databases)
  try {
    await execQuery('ALTER TABLE storages ADD COLUMN rawMaterial TEXT');
  } catch (error) {
    // Column might already exist, ignore the error
    if (!error.message.includes('duplicate column name')) {
      console.log('Note: rawMaterial column might already exist');
    }
  }

  // Insert default categories
  await runQuery(
    `INSERT OR IGNORE INTO categories (name, icon) VALUES 
    ('Vegetables', '🥬'),
    ('Fruits', '🍎'),
    ('Grains', '🌾'),
    ('Dairy', '🧀'),
    ('Proteins', '🥚'),
    ('Other', '📦')`
  );

  console.log('✅ Database initialized');
}

export function getDatabase() {
  return {
    run: runQuery,
    get: getQuery,
    all: allQuery,
    exec: execQuery
  };
}
