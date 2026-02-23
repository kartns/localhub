-- Migration 003: Add bio_certified column to storages
-- This adds a boolean (INTEGER 0/1) flag for organic/bio certification

ALTER TABLE storages ADD COLUMN bio_certified INTEGER DEFAULT 0;
