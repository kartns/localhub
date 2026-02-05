#!/usr/bin/env node
/**
 * Database Migration Runner
 * Run this script to apply migrations to the production database
 * 
 * Usage: node run-migrations.js
 * 
 * Environment variables:
 *   DB_PATH - Path to the SQLite database file (required in production)
 */

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get database path
const getDbPath = () => {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  return path.join(__dirname, 'data', 'storage.db');
};

const dbPath = getDbPath();
console.log(`📂 Database path: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found!');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

// Helper to run queries
const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

// Get all migration files
const migrationsDir = path.join(__dirname, 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`\n📋 Found ${migrationFiles.length} migration(s):\n`);

async function runMigrations() {
  for (const file of migrationFiles) {
    console.log(`⏳ Running migration: ${file}`);
    
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await runQuery(statement);
        console.log(`   ✅ Statement executed successfully`);
      } catch (error) {
        // Ignore "duplicate column" errors - column already exists
        if (error.message.includes('duplicate column name')) {
          console.log(`   ⚠️  Column already exists, skipping`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Migration ${file} completed\n`);
  }
  
  console.log('🎉 All migrations completed!');
  db.close();
}

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err);
  db.close();
  process.exit(1);
});
