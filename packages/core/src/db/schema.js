"use strict";
/**
 * DocTrack Production PostgreSQL Drizzle Schema Definition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_PG_MIGRATION_SQL = void 0;
exports.INITIAL_PG_MIGRATION_SQL = `
-- DocTrack Initial Production PostgreSQL Database Schema Migration (v1.0.0)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_key VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(128) DEFAULT 'application/pdf',
  file_hash VARCHAR(64),
  page_count INT DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'Uploading',
  processing_error TEXT,
  version INT DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON documents(workspace_id);

CREATE TABLE IF NOT EXISTS sharing_links (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  is_password_protected BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_views INT,
  current_views INT DEFAULT 0,
  is_revoked BOOLEAN DEFAULT FALSE,
  allow_download BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sharing_links_slug ON sharing_links(slug);

CREATE TABLE IF NOT EXISTS viewer_sessions (
  id VARCHAR(64) PRIMARY KEY,
  link_id VARCHAR(64) NOT NULL REFERENCES sharing_links(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  viewer_ip VARCHAR(45) NOT NULL,
  user_agent TEXT,
  country VARCHAR(10) DEFAULT 'US',
  status VARCHAR(32) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL REFERENCES viewer_sessions(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  link_id VARCHAR(64) NOT NULL REFERENCES sharing_links(id) ON DELETE CASCADE,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  page_number INT,
  duration_ms INT,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_doc_id ON analytics_events(document_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(128) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
//# sourceMappingURL=schema.js.map