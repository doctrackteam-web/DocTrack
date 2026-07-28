"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static sanitize(obj) {
        const sanitized = { ...obj };
        const sensitiveKeys = [
            'password',
            'token',
            'secret',
            'signature',
            'passwordHash',
            'rawSessionToken',
        ];
        for (const key of Object.keys(sanitized)) {
            if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    static info(message, context = {}) {
        const payload = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message,
            ...this.sanitize(context),
        };
        console.log(JSON.stringify(payload));
    }
    static error(message, error, context = {}) {
        const payload = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            error: error instanceof Error
                ? { name: error.name, message: error.message, stack: error.stack }
                : String(error),
            ...this.sanitize(context),
        };
        console.error(JSON.stringify(payload));
    }
    static captureException(error, context = {}) {
        this.error('Unhandled Exception Captured', error, context);
        // Sentry / OpenTelemetry Hook
        if (process.env.SENTRY_DSN) {
            // Dispatch to Sentry Sdk if configured
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map