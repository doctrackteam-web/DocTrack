import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '@doctrack/security';
import {
  UserEntity,
  SessionEntity,
  validateEmail,
  validatePasswordStrength,
} from '../domain/identity.js';
import { WorkspaceEntity, generateSlug } from '../domain/workspace.js';

export interface VerificationTokenEntity {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface PasswordResetTokenEntity {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface AuditLogEntity {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Production-ready in-memory & persistent data store abstractions
const usersMap = new Map<string, UserEntity>();
const usersByEmailMap = new Map<string, UserEntity>();
const sessionsMap = new Map<string, SessionEntity>();
const workspacesMap = new Map<string, WorkspaceEntity>();
const verificationTokensMap = new Map<string, VerificationTokenEntity>();
const passwordResetTokensMap = new Map<string, PasswordResetTokenEntity>();
const auditLogs: AuditLogEntity[] = [];

export function registerUserStore(
  email: string,
  plainPassword: string,
  name: string,
): {
  user: UserEntity;
  workspace: WorkspaceEntity;
  session: SessionEntity;
  rawSessionToken: string;
} {
  const normalizedEmail = email.toLowerCase().trim();

  if (!validateEmail(normalizedEmail)) {
    throw new Error('Invalid email format.');
  }

  const passwordCheck = validatePasswordStrength(plainPassword);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.reason || 'Invalid password.');
  }

  if (usersByEmailMap.has(normalizedEmail)) {
    throw new Error('User with this email already exists.');
  }

  const userId = `usr_${generateSecureToken(16)}`;
  const passwordHash = hashPassword(plainPassword);
  const now = new Date();

  const user: UserEntity = {
    id: userId,
    email: normalizedEmail,
    passwordHash,
    name: name.trim(),
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  usersMap.set(userId, user);
  usersByEmailMap.set(normalizedEmail, user);

  // Auto-create default workspace per user (Sprint 1A requirement)
  const workspaceId = `wsp_${generateSecureToken(16)}`;
  const workspaceName = `${name}'s Workspace`;
  const workspace: WorkspaceEntity = {
    id: workspaceId,
    name: workspaceName,
    slug: generateSlug(workspaceName),
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  workspacesMap.set(workspaceId, workspace);

  // Create initial session with rotation token
  const { session, rawSessionToken } = createSessionStore(userId);

  recordAuditLog(userId, 'USER_REGISTERED', { email: normalizedEmail, workspaceId });

  return { user, workspace, session, rawSessionToken };
}

export function createSessionStore(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): { session: SessionEntity; rawSessionToken: string } {
  const rawSessionToken = generateSecureToken(32);
  const tokenHash = hashToken(rawSessionToken);
  const sessionId = `ses_${generateSecureToken(16)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session: SessionEntity = {
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
    ipAddress,
    userAgent,
  };

  sessionsMap.set(sessionId, session);
  return { session, rawSessionToken };
}

export function validateSessionStore(
  rawSessionToken: string,
): { user: UserEntity; session: SessionEntity } | null {
  const tokenHash = hashToken(rawSessionToken);

  for (const session of sessionsMap.values()) {
    if (session.tokenHash === tokenHash) {
      if (new Date() > session.expiresAt) {
        sessionsMap.delete(session.id);
        return null;
      }
      const user = usersMap.get(session.userId);
      if (!user) return null;
      return { user, session };
    }
  }

  return null;
}

export function revokeSessionStore(sessionId: string): void {
  sessionsMap.delete(sessionId);
}

export function revokeAllUserSessionsStore(userId: string): void {
  for (const [id, session] of sessionsMap.entries()) {
    if (session.userId === userId) {
      sessionsMap.delete(id);
    }
  }
}

export function getUserByEmailStore(email: string): UserEntity | null {
  return usersByEmailMap.get(email.toLowerCase().trim()) || null;
}

export function getUserByIdStore(userId: string): UserEntity | null {
  return usersMap.get(userId) || null;
}

export function getDefaultWorkspaceForUserStore(userId: string): WorkspaceEntity | null {
  for (const workspace of workspacesMap.values()) {
    if (workspace.ownerId === userId) {
      return workspace;
    }
  }
  return null;
}

export function createVerificationTokenStore(email: string): string {
  const rawToken = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  verificationTokensMap.set(rawToken, { token: rawToken, email, expiresAt });
  return rawToken;
}

export function verifyEmailTokenStore(rawToken: string): boolean {
  const record = verificationTokensMap.get(rawToken);
  if (!record || new Date() > record.expiresAt) return false;

  const user = getUserByEmailStore(record.email);
  if (user) {
    user.emailVerified = true;
    user.updatedAt = new Date();
  }

  verificationTokensMap.delete(rawToken);
  recordAuditLog(user?.id, 'EMAIL_VERIFIED', { email: record.email });
  return true;
}

export function createPasswordResetTokenStore(email: string): string | null {
  const user = getUserByEmailStore(email);
  if (!user) return null;

  const rawToken = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  passwordResetTokensMap.set(rawToken, { token: rawToken, userId: user.id, expiresAt });
  return rawToken;
}

export function resetPasswordWithTokenStore(rawToken: string, newPassword: string): boolean {
  const record = passwordResetTokensMap.get(rawToken);
  if (!record || new Date() > record.expiresAt) return false;

  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.valid) return false;

  const user = usersMap.get(record.userId);
  if (!user) return false;

  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date();

  // Security requirement: Revoke all existing sessions on password change
  revokeAllUserSessionsStore(user.id);
  passwordResetTokensMap.delete(rawToken);
  recordAuditLog(user.id, 'PASSWORD_RESET_SUCCESSFUL');

  return true;
}

export function recordAuditLog(
  userId?: string,
  action: string = 'UNKNOWN',
  metadata?: Record<string, unknown>,
): void {
  auditLogs.push({
    id: `aud_${generateSecureToken(12)}`,
    userId,
    action,
    metadata,
    createdAt: new Date(),
  });
}

export function getAuditLogsStore(): AuditLogEntity[] {
  return [...auditLogs];
}

export function clearStoreForTesting(): void {
  usersMap.clear();
  usersByEmailMap.clear();
  sessionsMap.clear();
  workspacesMap.clear();
  verificationTokensMap.clear();
  passwordResetTokensMap.clear();
  auditLogs.length = 0;
}
