/**
 * DocTrack Production PostgreSQL Drizzle Schema Definition
 */
export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbWorkspace {
  id: string;
  organizationId?: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbDocument {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  pageCount: number;
  status: string;
  processingError?: string;
  version: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbSharingLink {
  id: string;
  documentId: string;
  workspaceId: string;
  ownerId: string;
  slug: string;
  passwordHash?: string;
  isPasswordProtected: boolean;
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  isRevoked: boolean;
  allowDownload: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbViewerSession {
  id: string;
  linkId: string;
  documentId: string;
  workspaceId: string;
  viewerIp: string;
  userAgent: string;
  country: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface DbAnalyticsEvent {
  id: string;
  sessionId: string;
  documentId: string;
  linkId: string;
  workspaceId: string;
  eventType: string;
  pageNumber?: number;
  durationMs?: number;
  metadata?: string;
  createdAt: Date;
}
export interface DbAuditLog {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  createdAt: Date;
}
export declare const INITIAL_PG_MIGRATION_SQL =
  "\n-- DocTrack Initial Production PostgreSQL Database Schema Migration (v1.0.0)\n\nCREATE TABLE IF NOT EXISTS users (\n  id VARCHAR(64) PRIMARY KEY,\n  email VARCHAR(255) NOT NULL UNIQUE,\n  password_hash VARCHAR(255) NOT NULL,\n  name VARCHAR(255) NOT NULL,\n  email_verified BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX IF NOT EXISTS idx_users_email ON users(email);\n\nCREATE TABLE IF NOT EXISTS sessions (\n  id VARCHAR(64) PRIMARY KEY,\n  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  token_hash VARCHAR(64) NOT NULL UNIQUE,\n  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  ip_address VARCHAR(45),\n  user_agent TEXT\n);\n\nCREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);\nCREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);\n\nCREATE TABLE IF NOT EXISTS workspaces (\n  id VARCHAR(64) PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  slug VARCHAR(255) NOT NULL UNIQUE,\n  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);\n\nCREATE TABLE IF NOT EXISTS documents (\n  id VARCHAR(64) PRIMARY KEY,\n  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,\n  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  title VARCHAR(255) NOT NULL,\n  file_key VARCHAR(512) NOT NULL,\n  file_size BIGINT NOT NULL,\n  mime_type VARCHAR(128) DEFAULT 'application/pdf',\n  file_hash VARCHAR(64),\n  page_count INT DEFAULT 0,\n  status VARCHAR(32) NOT NULL DEFAULT 'Uploading',\n  processing_error TEXT,\n  version INT DEFAULT 1,\n  is_deleted BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON documents(workspace_id);\n\nCREATE TABLE IF NOT EXISTS sharing_links (\n  id VARCHAR(64) PRIMARY KEY,\n  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,\n  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,\n  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  slug VARCHAR(128) NOT NULL UNIQUE,\n  password_hash VARCHAR(255),\n  is_password_protected BOOLEAN DEFAULT FALSE,\n  expires_at TIMESTAMP WITH TIME ZONE,\n  max_views INT,\n  current_views INT DEFAULT 0,\n  is_revoked BOOLEAN DEFAULT FALSE,\n  allow_download BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX IF NOT EXISTS idx_sharing_links_slug ON sharing_links(slug);\n\nCREATE TABLE IF NOT EXISTS viewer_sessions (\n  id VARCHAR(64) PRIMARY KEY,\n  link_id VARCHAR(64) NOT NULL REFERENCES sharing_links(id) ON DELETE CASCADE,\n  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,\n  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,\n  viewer_ip VARCHAR(45) NOT NULL,\n  user_agent TEXT,\n  country VARCHAR(10) DEFAULT 'US',\n  status VARCHAR(32) DEFAULT 'Active',\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE IF NOT EXISTS analytics_events (\n  id VARCHAR(64) PRIMARY KEY,\n  session_id VARCHAR(64) NOT NULL REFERENCES viewer_sessions(id) ON DELETE CASCADE,\n  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,\n  link_id VARCHAR(64) NOT NULL REFERENCES sharing_links(id) ON DELETE CASCADE,\n  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,\n  event_type VARCHAR(64) NOT NULL,\n  page_number INT,\n  duration_ms INT,\n  metadata TEXT,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX IF NOT EXISTS idx_analytics_events_doc_id ON analytics_events(document_id);\n\nCREATE TABLE IF NOT EXISTS audit_logs (\n  id VARCHAR(64) PRIMARY KEY,\n  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,\n  action VARCHAR(128) NOT NULL,\n  ip_address VARCHAR(45),\n  user_agent TEXT,\n  metadata TEXT,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n";
//# sourceMappingURL=schema.d.ts.map
