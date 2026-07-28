import test from 'node:test';
import assert from 'node:assert';
import { clearStoreForTesting } from '@doctrack/core';
import { clearRateLimitStore } from '@doctrack/security';
import { POST as registerHandler } from './register/route.js';
import { POST as loginHandler } from './login/route.js';
import { POST as logoutHandler } from './logout/route.js';
import { GET as sessionHandler } from './session/route.js';
import { POST as forgotPasswordHandler } from './forgot-password/route.js';
import { POST as resetPasswordHandler } from './reset-password/route.js';

test('E2E Integration Flow: Registration -> Login -> Session Validation -> Logout', async () => {
  clearStoreForTesting();
  clearRateLimitStore();

  // 1. User Registration
  const regReq = new Request('http://localhost/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'e2e@doctrack.com',
      password: 'StrongPassword123!',
      name: 'E2E User',
    }),
  });

  const regRes = await registerHandler(regReq);
  assert.strictEqual(regRes.status, 201);
  const regBody = await regRes.json();
  assert.strictEqual(regBody.success, true);
  assert.strictEqual(regBody.data.user.email, 'e2e@doctrack.com');
  assert.strictEqual(regBody.data.workspace.name, "E2E User's Workspace");

  // Extract Session Cookie token from headers
  const setCookie = regRes.headers.get('set-cookie') || '';
  assert.ok(setCookie.includes('doctrack_session='));
  const tokenMatch = setCookie.match(/doctrack_session=([^;]+)/);
  const sessionToken = tokenMatch ? tokenMatch[1] : '';
  assert.ok(sessionToken);

  // 2. Session Validation GET /api/v1/auth/session
  const sessReq = new Request('http://localhost/api/v1/auth/session', {
    method: 'GET',
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  const sessRes = await sessionHandler(sessReq);
  assert.strictEqual(sessRes.status, 200);
  const sessBody = await sessRes.json();
  assert.strictEqual(sessBody.data.user.email, 'e2e@doctrack.com');

  // 3. User Login
  const loginReq = new Request('http://localhost/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'e2e@doctrack.com',
      password: 'StrongPassword123!',
    }),
  });

  const loginRes = await loginHandler(loginReq);
  assert.strictEqual(loginRes.status, 200);

  // 4. Logout
  const logoutReq = new Request('http://localhost/api/v1/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  const logoutRes = await logoutHandler(logoutReq);
  assert.strictEqual(logoutRes.status, 200);

  // 5. Session Validation should now fail after logout
  const postLogoutSessRes = await sessionHandler(sessReq);
  assert.strictEqual(postLogoutSessRes.status, 401);
});

test('E2E Integration Flow: Brute Force Account Lockout', async () => {
  clearStoreForTesting();
  clearRateLimitStore();

  // Register User
  await registerHandler(
    new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'lockout@doctrack.com',
        password: 'Password123!',
        name: 'Lockout Test',
      }),
    }),
  );

  // 5 Consecutive Failed Logins
  for (let i = 0; i < 5; i++) {
    const badLoginRes = await loginHandler(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'lockout@doctrack.com',
          password: 'WrongPassword!',
        }),
      }),
    );
    assert.ok(badLoginRes.status === 401 || badLoginRes.status === 423);
  }

  // 6th Attempt should yield 423 Account Locked
  const lockedRes = await loginHandler(
    new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'lockout@doctrack.com',
        password: 'Password123!',
      }),
    }),
  );

  assert.strictEqual(lockedRes.status, 423);
});

test('E2E Integration Flow: Forgot Password & Reset Password', async () => {
  clearStoreForTesting();
  clearRateLimitStore();

  // Register User
  await registerHandler(
    new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'resetflow@doctrack.com',
        password: 'OriginalPassword123!',
        name: 'Reset Flow User',
      }),
    }),
  );

  // Request Reset Token
  const forgotRes = await forgotPasswordHandler(
    new Request('http://localhost/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'resetflow@doctrack.com' }),
    }),
  );

  assert.strictEqual(forgotRes.status, 200);
  const forgotBody = await forgotRes.json();
  const resetToken = forgotBody.data.resetToken;
  assert.ok(resetToken);

  // Reset Password with Token
  const resetRes = await resetPasswordHandler(
    new Request('http://localhost/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: resetToken, newPassword: 'BrandNewPassword123!' }),
    }),
  );

  assert.strictEqual(resetRes.status, 200);

  // Login with new password should succeed
  const loginRes = await loginHandler(
    new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'resetflow@doctrack.com', password: 'BrandNewPassword123!' }),
    }),
  );

  assert.strictEqual(loginRes.status, 200);
});
