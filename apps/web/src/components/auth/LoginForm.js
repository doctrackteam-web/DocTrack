"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitLogin = submitLogin;
async function submitLogin(payload) {
    const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
}
//# sourceMappingURL=LoginForm.js.map