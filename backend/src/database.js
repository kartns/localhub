import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use environment variable for database path in production, fallback to local path
const getDbPath = () => {
  if (process.env.NODE_ENV === 'production' && process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  
  // Development: use relative path
  const dataDir = path.join(__dirname, '../data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  return path.join(dataDir, 'storage.db');
};

const dbPath = getDbPath();

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
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

  // Seed admin user if doesn't exist
  const adminExists = await getQuery('SELECT id FROM users WHERE email = ?', ['kartns93@hotmail.com']);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await runQuery(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['kartns93@hotmail.com', hashedPassword, 'Admin', 'admin']
    );
    console.log('✅ Admin user created (email: kartns93@hotmail.com, password: admin)');
  }

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
