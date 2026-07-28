"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const identity_js_1 = require("./identity.js");
const workspace_js_1 = require("./workspace.js");
(0, node_test_1.default)('Domain Rule: Email Validation', () => {
    node_assert_1.default.strictEqual((0, identity_js_1.validateEmail)('user@doctrack.com'), true);
    node_assert_1.default.strictEqual((0, identity_js_1.validateEmail)('invalid-email'), false);
    node_assert_1.default.strictEqual((0, identity_js_1.validateEmail)('user@'), false);
});
(0, node_test_1.default)('Domain Rule: Password Strength Validation', () => {
    node_assert_1.default.strictEqual((0, identity_js_1.validatePasswordStrength)('12345678').valid, true);
    node_assert_1.default.strictEqual((0, identity_js_1.validatePasswordStrength)('short').valid, false);
});
(0, node_test_1.default)('Domain Rule: Workspace Slug Generation', () => {
    node_assert_1.default.strictEqual((0, workspace_js_1.generateSlug)('My Enterprise Workspace'), 'my-enterprise-workspace');
    node_assert_1.default.strictEqual((0, workspace_js_1.generateSlug)('DocTrack - Sales Dept!'), 'doctrack-sales-dept');
});
//# sourceMappingURL=domain.test.js.map