-- Production Database Migration Script
-- Date: 2026-02-05
-- Description: Add missing columns to storages table and create settings table

-- Begin transaction for atomic migration
BEGIN TRANSACTION;

-- Add missing columns to storages table
ALTER TABLE storages ADD COLUMN phone TEXT;
ALTER TABLE storages ADD COLUMN website TEXT;
ALTER TABLE storages ADD COLUMN featured_farmer_image TEXT;
ALTER TABLE storages ADD COLUMN instagram TEXT;
ALTER TABLE storages ADD COLUMN facebook TEXT;
ALTER TABLE storages ADD COLUMN twitter TEXT;
ALTER TABLE storages ADD COLUMN tiktok TEXT;
ALTER TABLE storages ADD COLUMN producer_name TEXT;

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Commit the transaction
COMMIT;