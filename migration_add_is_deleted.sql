-- Cloudflare D1 Migration: Add missing is_deleted column to posts table
ALTER TABLE posts ADD COLUMN is_deleted INTEGER DEFAULT 0;
