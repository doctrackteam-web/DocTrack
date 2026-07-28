"use strict";
/**
 * DocTrack Transactional Email Engine & Template System
 * Supports technology-agnostic email providers (Resend, SendGrid, Postmark, AWS SES).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionalEmail = sendTransactionalEmail;
exports.renderVerificationEmailHtml = renderVerificationEmailHtml;
exports.renderPasswordResetEmailHtml = renderPasswordResetEmailHtml;
exports.renderSecurityAlertEmailHtml = renderSecurityAlertEmailHtml;
async function sendTransactionalEmail(options) {
    // In development & test environments, log email payload safely
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Email Engine] Sent email to: ${options.to} | Subject: "${options.subject}"`);
        return { success: true, messageId: `msg_${Math.random().toString(36).slice(2, 10)}` };
    }
    // Production provider integration (Resend / Postmark / SendGrid abstraction)
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
    if (!apiKey) {
        console.warn(`[Email Engine] Warning: RESEND_API_KEY missing in production environment.`);
        return { success: false };
    }
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'DocTrack Security <security@doctrack.com>',
                to: options.to,
                subject: options.subject,
                html: options.html,
            }),
        });
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Email Engine] Email delivery failed: ${errText}`);
            return { success: false };
        }
        const data = (await response.json());
        return { success: true, messageId: data.id };
    }
    catch (err) {
        console.error(`[Email Engine] Error dispatching email:`, err);
        return { success: false };
    }
}
function renderVerificationEmailHtml(name, verificationUrl) {
    return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0F172A;">
      <h2 style="color: #2563EB;">Welcome to DocTrack, ${name}!</h2>
      <p>Please verify your email address to complete your account setup and activate your secure document workspace.</p>
      <p style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email Address</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">This link expires in 24 hours. If you did not create a DocTrack account, please ignore this message.</p>
    </div>
  `;
}
function renderPasswordResetEmailHtml(name, resetUrl) {
    return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0F172A;">
      <h2 style="color: #0F172A;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your DocTrack account password. Click the button below to choose a new password:</p>
      <p style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #0F172A; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">This link expires in 1 hour. If you did not request a password reset, your account is safe and no action is required.</p>
    </div>
  `;
}
function renderSecurityAlertEmailHtml(name, ipAddress, device) {
    return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0F172A;">
      <h2 style="color: #DC2626;">Security Alert: New Sign-In Detected</h2>
      <p>Hello ${name},</p>
      <p>Your DocTrack account was just accessed from a new device:</p>
      <ul>
        <li><strong>IP Address:</strong> ${ipAddress}</li>
        <li><strong>Device / User-Agent:</strong> ${device}</li>
        <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
      </ul>
      <p>If this was you, you can safely ignore this email. If you suspect unauthorized access, please reset your password immediately.</p>
    </div>
  `;
}
//# sourceMappingURL=email-service.js.map