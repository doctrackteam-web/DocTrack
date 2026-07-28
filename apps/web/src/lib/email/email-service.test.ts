import test from 'node:test';
import assert from 'node:assert';
import {
  sendTransactionalEmail,
  renderVerificationEmailHtml,
  renderPasswordResetEmailHtml,
  renderSecurityAlertEmailHtml,
} from './email-service.js';

test('Email Engine: Template Rendering', () => {
  const verifyHtml = renderVerificationEmailHtml('Alice', 'https://doctrack.com/verify?token=123');
  assert.ok(verifyHtml.includes('Alice'));
  assert.ok(verifyHtml.includes('https://doctrack.com/verify?token=123'));

  const resetHtml = renderPasswordResetEmailHtml('Bob', 'https://doctrack.com/reset?token=456');
  assert.ok(resetHtml.includes('Bob'));
  assert.ok(resetHtml.includes('https://doctrack.com/reset?token=456'));

  const alertHtml = renderSecurityAlertEmailHtml('Charlie', '192.168.1.1', 'Chrome / macOS');
  assert.ok(alertHtml.includes('Charlie'));
  assert.ok(alertHtml.includes('192.168.1.1'));
});

test('Email Engine: Dispatch Transactional Email', async () => {
  const result = await sendTransactionalEmail({
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test Body</p>',
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.messageId);
});
