import test from 'node:test';
import assert from 'node:assert';
import {
  registerUserStore,
  getUserByEmailStore,
  createSessionStore,
  validateSessionStore,
  revokeSessionStore,
  createPasswordResetTokenStore,
  resetPasswordWithTokenStore,
  clearStoreForTesting,
} from './auth-store.js';
import { verifyPassword } from '@doctrack/security';

test('Auth Store: User Registration & Default Workspace Auto-Provisioning', () => {
  clearStoreForTesting();
  const { user, workspace, session, rawSessionToken } = registerUserStore(
    'testuser@doctrack.com',
    'SecurePass123!',
    'John Doe',
  );

  assert.strictEqual(user.email, 'testuser@doctrack.com');
  assert.strictEqual(user.name, 'John Doe');
  assert.strictEqual(workspace.name, "John Doe's Workspace");
  assert.strictEqual(workspace.ownerId, user.id);
  assert.ok(rawSessionToken);

  const fetchedUser = getUserByEmailStore('testuser@doctrack.com');
  assert.ok(fetchedUser);
  assert.strictEqual(verifyPassword('SecurePass123!', fetchedUser.passwordHash), true);
});

test('Auth Store: Session Validation & Revocation', () => {
  clearStoreForTesting();
  const { user, rawSessionToken } = registerUserStore(
    'session@doctrack.com',
    'SecurePass123!',
    'Session User',
  );

  const validated = validateSessionStore(rawSessionToken);
  assert.ok(validated);
  assert.strictEqual(validated.user.id, user.id);

  revokeSessionStore(validated.session.id);
  const revalidated = validateSessionStore(rawSessionToken);
  assert.strictEqual(revalidated, null);
});

test('Auth Store: Password Reset & Session Invalidation', () => {
  clearStoreForTesting();
  const { user, rawSessionToken } = registerUserStore(
    'reset@doctrack.com',
    'OldPassword123!',
    'Reset User',
  );

  const resetToken = createPasswordResetTokenStore('reset@doctrack.com');
  assert.ok(resetToken);

  const success = resetPasswordWithTokenStore(resetToken, 'NewPassword123!');
  assert.strictEqual(success, true);

  // Verify old session token was revoked on password reset
  const oldSessionValid = validateSessionStore(rawSessionToken);
  assert.strictEqual(oldSessionValid, null);
});
