"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const security_1 = require("@doctrack/security");
const route_js_1 = require("./register/route.js");
const route_js_2 = require("./login/route.js");
const route_js_3 = require("./logout/route.js");
const route_js_4 = require("./session/route.js");
const route_js_5 = require("./forgot-password/route.js");
const route_js_6 = require("./reset-password/route.js");
(0, node_test_1.default)('E2E Integration Flow: Registration -> Login -> Session Validation -> Logout', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // 1. User Registration
    const regReq = new Request('http://localhost/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: 'e2e@doctrack.com',
            password: 'StrongPassword123!',
            name: 'E2E User',
        }),
    });
    const regRes = await (0, route_js_1.POST)(regReq);
    node_assert_1.default.strictEqual(regRes.status, 201);
    const regBody = await regRes.json();
    node_assert_1.default.strictEqual(regBody.success, true);
    node_assert_1.default.strictEqual(regBody.data.user.email, 'e2e@doctrack.com');
    node_assert_1.default.strictEqual(regBody.data.workspace.name, "E2E User's Workspace");
    // Extract Session Cookie token from headers
    const setCookie = regRes.headers.get('set-cookie') || '';
    node_assert_1.default.ok(setCookie.includes('doctrack_session='));
    const tokenMatch = setCookie.match(/doctrack_session=([^;]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : '';
    node_assert_1.default.ok(sessionToken);
    // 2. Session Validation GET /api/v1/auth/session
    const sessReq = new Request('http://localhost/api/v1/auth/session', {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const sessRes = await (0, route_js_4.GET)(sessReq);
    node_assert_1.default.strictEqual(sessRes.status, 200);
    const sessBody = await sessRes.json();
    node_assert_1.default.strictEqual(sessBody.data.user.email, 'e2e@doctrack.com');
    // 3. User Login
    const loginReq = new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'e2e@doctrack.com',
            password: 'StrongPassword123!',
        }),
    });
    const loginRes = await (0, route_js_2.POST)(loginReq);
    node_assert_1.default.strictEqual(loginRes.status, 200);
    // 4. Logout
    const logoutReq = new Request('http://localhost/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const logoutRes = await (0, route_js_3.POST)(logoutReq);
    node_assert_1.default.strictEqual(logoutRes.status, 200);
    // 5. Session Validation should now fail after logout
    const postLogoutSessRes = await (0, route_js_4.GET)(sessReq);
    node_assert_1.default.strictEqual(postLogoutSessRes.status, 401);
});
(0, node_test_1.default)('E2E Integration Flow: Brute Force Account Lockout', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // Register User
    await (0, route_js_1.POST)(new Request('http://localhost/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: 'lockout@doctrack.com',
            password: 'Password123!',
            name: 'Lockout Test',
        }),
    }));
    // 5 Consecutive Failed Logins
    for (let i = 0; i < 5; i++) {
        const badLoginRes = await (0, route_js_2.POST)(new Request('http://localhost/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'lockout@doctrack.com',
                password: 'WrongPassword!',
            }),
        }));
        node_assert_1.default.ok(badLoginRes.status === 401 || badLoginRes.status === 423);
    }
    // 6th Attempt should yield 423 Account Locked
    const lockedRes = await (0, route_js_2.POST)(new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'lockout@doctrack.com',
            password: 'Password123!',
        }),
    }));
    node_assert_1.default.strictEqual(lockedRes.status, 423);
});
(0, node_test_1.default)('E2E Integration Flow: Forgot Password & Reset Password', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // Register User
    await (0, route_js_1.POST)(new Request('http://localhost/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: 'resetflow@doctrack.com',
            password: 'OriginalPassword123!',
            name: 'Reset Flow User',
        }),
    }));
    // Request Reset Token
    const forgotRes = await (0, route_js_5.POST)(new Request('http://localhost/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: 'resetflow@doctrack.com' }),
    }));
    node_assert_1.default.strictEqual(forgotRes.status, 200);
    const forgotBody = await forgotRes.json();
    const resetToken = forgotBody.data.resetToken;
    node_assert_1.default.ok(resetToken);
    // Reset Password with Token
    const resetRes = await (0, route_js_6.POST)(new Request('http://localhost/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, newPassword: 'BrandNewPassword123!' }),
    }));
    node_assert_1.default.strictEqual(resetRes.status, 200);
    // Login with new password should succeed
    const loginRes = await (0, route_js_2.POST)(new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'resetflow@doctrack.com', password: 'BrandNewPassword123!' }),
    }));
    node_assert_1.default.strictEqual(loginRes.status, 200);
});
//# sourceMappingURL=auth.test.js.map