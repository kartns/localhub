-- Migration: Add phone and website columns to storages table
-- Date: 2026-02-03
-- Description: Adds phone and website fields for producer contact information

-- Add phone column if it doesn't exist
ALTER TABLE storages ADD COLUMN phone TEXT;

-- Add website column if it doesn't exist
ALTER TABLE storages ADD COLUMN website TEXT;
