"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validatePasswordStrength = validatePasswordStrength;
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePasswordStrength(password) {
    if (password.length < 8) {
        return { valid: false, reason: 'Password must be at least 8 characters long.' };
    }
    return { valid: true };
}
//# sourceMappingURL=identity.js.map