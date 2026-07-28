"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRegistration = submitRegistration;
async function submitRegistration(payload) {
    const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
}
//# sourceMappingURL=RegisterForm.js.map