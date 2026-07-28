"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const email_service_js_1 = require("./email-service.js");
(0, node_test_1.default)('Email Engine: Template Rendering', () => {
    const verifyHtml = (0, email_service_js_1.renderVerificationEmailHtml)('Alice', 'https://doctrack.com/verify?token=123');
    node_assert_1.default.ok(verifyHtml.includes('Alice'));
    node_assert_1.default.ok(verifyHtml.includes('https://doctrack.com/verify?token=123'));
    const resetHtml = (0, email_service_js_1.renderPasswordResetEmailHtml)('Bob', 'https://doctrack.com/reset?token=456');
    node_assert_1.default.ok(resetHtml.includes('Bob'));
    node_assert_1.default.ok(resetHtml.includes('https://doctrack.com/reset?token=456'));
    const alertHtml = (0, email_service_js_1.renderSecurityAlertEmailHtml)('Charlie', '192.168.1.1', 'Chrome / macOS');
    node_assert_1.default.ok(alertHtml.includes('Charlie'));
    node_assert_1.default.ok(alertHtml.includes('192.168.1.1'));
});
(0, node_test_1.default)('Email Engine: Dispatch Transactional Email', async () => {
    const result = await (0, email_service_js_1.sendTransactionalEmail)({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test Body</p>',
    });
    node_assert_1.default.strictEqual(result.success, true);
    node_assert_1.default.ok(result.messageId);
});
//# sourceMappingURL=email-service.test.js.map