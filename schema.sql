-- XIAS Cloud DNS PostgreSQL Database Schema
-- Run this on your PostgreSQL instance (Supabase, Neon, or Vercel Postgres)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subdomains (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  name VARCHAR(63) NOT NULL,
  domain_zone VARCHAR(32) NOT NULL,
  full_domain VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(32) DEFAULT 'active',
  is_proxied BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dns_records (
  id VARCHAR(64) PRIMARY KEY,
  subdomain_id VARCHAR(64) REFERENCES subdomains(id) ON DELETE CASCADE,
  type VARCHAR(16) NOT NULL,
  name VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  ttl INTEGER DEFAULT 1,
  proxied BOOLEAN DEFAULT TRUE,
  priority INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS url_redirects (
  id VARCHAR(64) PRIMARY KEY,
  subdomain_id VARCHAR(64) REFERENCES subdomains(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  preserve_path BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subdomains_full_domain ON subdomains(full_domain);
CREATE INDEX IF NOT EXISTS idx_dns_records_subdomain_id ON dns_records(subdomain_id);
