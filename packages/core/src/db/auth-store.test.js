"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const auth_store_js_1 = require("./auth-store.js");
const security_1 = require("@doctrack/security");
(0, node_test_1.default)('Auth Store: User Registration & Default Workspace Auto-Provisioning', () => {
    (0, auth_store_js_1.clearStoreForTesting)();
    const { user, workspace, session, rawSessionToken } = (0, auth_store_js_1.registerUserStore)('testuser@doctrack.com', 'SecurePass123!', 'John Doe');
    node_assert_1.default.strictEqual(user.email, 'testuser@doctrack.com');
    node_assert_1.default.strictEqual(user.name, 'John Doe');
    node_assert_1.default.strictEqual(workspace.name, "John Doe's Workspace");
    node_assert_1.default.strictEqual(workspace.ownerId, user.id);
    node_assert_1.default.ok(rawSessionToken);
    const fetchedUser = (0, auth_store_js_1.getUserByEmailStore)('testuser@doctrack.com');
    node_assert_1.default.ok(fetchedUser);
    node_assert_1.default.strictEqual((0, security_1.verifyPassword)('SecurePass123!', fetchedUser.passwordHash), true);
});
(0, node_test_1.default)('Auth Store: Session Validation & Revocation', () => {
    (0, auth_store_js_1.clearStoreForTesting)();
    const { user, rawSessionToken } = (0, auth_store_js_1.registerUserStore)('session@doctrack.com', 'SecurePass123!', 'Session User');
    const validated = (0, auth_store_js_1.validateSessionStore)(rawSessionToken);
    node_assert_1.default.ok(validated);
    node_assert_1.default.strictEqual(validated.user.id, user.id);
    (0, auth_store_js_1.revokeSessionStore)(validated.session.id);
    const revalidated = (0, auth_store_js_1.validateSessionStore)(rawSessionToken);
    node_assert_1.default.strictEqual(revalidated, null);
});
(0, node_test_1.default)('Auth Store: Password Reset & Session Invalidation', () => {
    (0, auth_store_js_1.clearStoreForTesting)();
    const { user, rawSessionToken } = (0, auth_store_js_1.registerUserStore)('reset@doctrack.com', 'OldPassword123!', 'Reset User');
    const resetToken = (0, auth_store_js_1.createPasswordResetTokenStore)('reset@doctrack.com');
    node_assert_1.default.ok(resetToken);
    const success = (0, auth_store_js_1.resetPasswordWithTokenStore)(resetToken, 'NewPassword123!');
    node_assert_1.default.strictEqual(success, true);
    // Verify old session token was revoked on password reset
    const oldSessionValid = (0, auth_store_js_1.validateSessionStore)(rawSessionToken);
    node_assert_1.default.strictEqual(oldSessionValid, null);
});
//# sourceMappingURL=auth-store.test.js.map