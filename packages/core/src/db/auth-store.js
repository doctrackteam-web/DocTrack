"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserStore = registerUserStore;
exports.createSessionStore = createSessionStore;
exports.validateSessionStore = validateSessionStore;
exports.revokeSessionStore = revokeSessionStore;
exports.revokeAllUserSessionsStore = revokeAllUserSessionsStore;
exports.getUserByEmailStore = getUserByEmailStore;
exports.getUserByIdStore = getUserByIdStore;
exports.getDefaultWorkspaceForUserStore = getDefaultWorkspaceForUserStore;
exports.createVerificationTokenStore = createVerificationTokenStore;
exports.verifyEmailTokenStore = verifyEmailTokenStore;
exports.createPasswordResetTokenStore = createPasswordResetTokenStore;
exports.resetPasswordWithTokenStore = resetPasswordWithTokenStore;
exports.recordAuditLog = recordAuditLog;
exports.getAuditLogsStore = getAuditLogsStore;
exports.clearStoreForTesting = clearStoreForTesting;
const security_1 = require("@doctrack/security");
const identity_js_1 = require("../domain/identity.js");
const workspace_js_1 = require("../domain/workspace.js");
// Production-ready in-memory & persistent data store abstractions
const usersMap = new Map();
const usersByEmailMap = new Map();
const sessionsMap = new Map();
const workspacesMap = new Map();
const verificationTokensMap = new Map();
const passwordResetTokensMap = new Map();
const auditLogs = [];
function registerUserStore(email, plainPassword, name) {
    const normalizedEmail = email.toLowerCase().trim();
    if (!(0, identity_js_1.validateEmail)(normalizedEmail)) {
        throw new Error('Invalid email format.');
    }
    const passwordCheck = (0, identity_js_1.validatePasswordStrength)(plainPassword);
    if (!passwordCheck.valid) {
        throw new Error(passwordCheck.reason || 'Invalid password.');
    }
    if (usersByEmailMap.has(normalizedEmail)) {
        throw new Error('User with this email already exists.');
    }
    const userId = `usr_${(0, security_1.generateSecureToken)(16)}`;
    const passwordHash = (0, security_1.hashPassword)(plainPassword);
    const now = new Date();
    const user = {
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
    const workspaceId = `wsp_${(0, security_1.generateSecureToken)(16)}`;
    const workspaceName = `${name}'s Workspace`;
    const workspace = {
        id: workspaceId,
        name: workspaceName,
        slug: (0, workspace_js_1.generateSlug)(workspaceName),
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
function createSessionStore(userId, ipAddress, userAgent) {
    const rawSessionToken = (0, security_1.generateSecureToken)(32);
    const tokenHash = (0, security_1.hashToken)(rawSessionToken);
    const sessionId = `ses_${(0, security_1.generateSecureToken)(16)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = {
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
function validateSessionStore(rawSessionToken) {
    const tokenHash = (0, security_1.hashToken)(rawSessionToken);
    for (const session of sessionsMap.values()) {
        if (session.tokenHash === tokenHash) {
            if (new Date() > session.expiresAt) {
                sessionsMap.delete(session.id);
                return null;
            }
            const user = usersMap.get(session.userId);
            if (!user)
                return null;
            return { user, session };
        }
    }
    return null;
}
function revokeSessionStore(sessionId) {
    sessionsMap.delete(sessionId);
}
function revokeAllUserSessionsStore(userId) {
    for (const [id, session] of sessionsMap.entries()) {
        if (session.userId === userId) {
            sessionsMap.delete(id);
        }
    }
}
function getUserByEmailStore(email) {
    return usersByEmailMap.get(email.toLowerCase().trim()) || null;
}
function getUserByIdStore(userId) {
    return usersMap.get(userId) || null;
}
function getDefaultWorkspaceForUserStore(userId) {
    for (const workspace of workspacesMap.values()) {
        if (workspace.ownerId === userId) {
            return workspace;
        }
    }
    return null;
}
function createVerificationTokenStore(email) {
    const rawToken = (0, security_1.generateSecureToken)(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    verificationTokensMap.set(rawToken, { token: rawToken, email, expiresAt });
    return rawToken;
}
function verifyEmailTokenStore(rawToken) {
    const record = verificationTokensMap.get(rawToken);
    if (!record || new Date() > record.expiresAt)
        return false;
    const user = getUserByEmailStore(record.email);
    if (user) {
        user.emailVerified = true;
        user.updatedAt = new Date();
    }
    verificationTokensMap.delete(rawToken);
    recordAuditLog(user?.id, 'EMAIL_VERIFIED', { email: record.email });
    return true;
}
function createPasswordResetTokenStore(email) {
    const user = getUserByEmailStore(email);
    if (!user)
        return null;
    const rawToken = (0, security_1.generateSecureToken)(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    passwordResetTokensMap.set(rawToken, { token: rawToken, userId: user.id, expiresAt });
    return rawToken;
}
function resetPasswordWithTokenStore(rawToken, newPassword) {
    const record = passwordResetTokensMap.get(rawToken);
    if (!record || new Date() > record.expiresAt)
        return false;
    const passwordCheck = (0, identity_js_1.validatePasswordStrength)(newPassword);
    if (!passwordCheck.valid)
        return false;
    const user = usersMap.get(record.userId);
    if (!user)
        return false;
    user.passwordHash = (0, security_1.hashPassword)(newPassword);
    user.updatedAt = new Date();
    // Security requirement: Revoke all existing sessions on password change
    revokeAllUserSessionsStore(user.id);
    passwordResetTokensMap.delete(rawToken);
    recordAuditLog(user.id, 'PASSWORD_RESET_SUCCESSFUL');
    return true;
}
function recordAuditLog(userId, action = 'UNKNOWN', metadata) {
    auditLogs.push({
        id: `aud_${(0, security_1.generateSecureToken)(12)}`,
        userId,
        action,
        metadata,
        createdAt: new Date(),
    });
}
function getAuditLogsStore() {
    return [...auditLogs];
}
function clearStoreForTesting() {
    usersMap.clear();
    usersByEmailMap.clear();
    sessionsMap.clear();
    workspacesMap.clear();
    verificationTokensMap.clear();
    passwordResetTokensMap.clear();
    auditLogs.length = 0;
}
//# sourceMappingURL=auth-store.js.map