-- Migration: Add story_points column to storages table
-- Date: 2026-02-06
-- Description: Add JSON column for storing customizable story board content

-- Add story_points column to store JSON configuration
ALTER TABLE storages ADD COLUMN story_points TEXT;
