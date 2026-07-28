import { UserEntity, SessionEntity } from '../domain/identity.js';
import { WorkspaceEntity } from '../domain/workspace.js';
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
export declare function registerUserStore(
  email: string,
  plainPassword: string,
  name: string,
): {
  user: UserEntity;
  workspace: WorkspaceEntity;
  session: SessionEntity;
  rawSessionToken: string;
};
export declare function createSessionStore(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): {
  session: SessionEntity;
  rawSessionToken: string;
};
export declare function validateSessionStore(rawSessionToken: string): {
  user: UserEntity;
  session: SessionEntity;
} | null;
export declare function revokeSessionStore(sessionId: string): void;
export declare function revokeAllUserSessionsStore(userId: string): void;
export declare function getUserByEmailStore(email: string): UserEntity | null;
export declare function getUserByIdStore(userId: string): UserEntity | null;
export declare function getDefaultWorkspaceForUserStore(userId: string): WorkspaceEntity | null;
export declare function createVerificationTokenStore(email: string): string;
export declare function verifyEmailTokenStore(rawToken: string): boolean;
export declare function createPasswordResetTokenStore(email: string): string | null;
export declare function resetPasswordWithTokenStore(rawToken: string, newPassword: string): boolean;
export declare function recordAuditLog(
  userId?: string,
  action?: string,
  metadata?: Record<string, unknown>,
): void;
export declare function getAuditLogsStore(): AuditLogEntity[];
export declare function clearStoreForTesting(): void;
//# sourceMappingURL=auth-store.d.ts.map
