import test from 'node:test';
import assert from 'node:assert';
import { validateEmail, validatePasswordStrength } from './identity.js';
import { generateSlug } from './workspace.js';

test('Domain Rule: Email Validation', () => {
  assert.strictEqual(validateEmail('user@doctrack.com'), true);
  assert.strictEqual(validateEmail('invalid-email'), false);
  assert.strictEqual(validateEmail('user@'), false);
});

test('Domain Rule: Password Strength Validation', () => {
  assert.strictEqual(validatePasswordStrength('12345678').valid, true);
  assert.strictEqual(validatePasswordStrength('short').valid, false);
});

test('Domain Rule: Workspace Slug Generation', () => {
  assert.strictEqual(generateSlug('My Enterprise Workspace'), 'my-enterprise-workspace');
  assert.strictEqual(generateSlug('DocTrack - Sales Dept!'), 'doctrack-sales-dept');
});
