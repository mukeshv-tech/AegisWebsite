-- Cloudflare D1 Database Schema for Aegis Blog Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pub_date TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial v1.0.0 release post into D1
INSERT OR IGNORE INTO posts (id, slug, title, description, pub_date, author, category, content)
VALUES (
  'v1-0-0-release',
  'v1-0-0-release',
  'Announcing Aegis v1.0.0: Zero-Trust Remote Environment Workstation',
  'Introducing Aegis v1.0.0 GA. Built for SREs and DevOps leads with WebGL terminal rendering, zero-knowledge Scrypt vault encryption, parallel multi-server execution, and live vitals telemetry.',
  '2026-08-08',
  'Mukesh (@mukeshv-tech)',
  'Release Announcement',
  'We are excited to announce the general availability of **Aegis v1.0.0**, a desktop workstation engineered for DevOps leads, SREs, and security engineers managing multi-cloud remote environments.'
);
