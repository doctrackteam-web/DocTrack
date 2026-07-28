/**
 * DocTrack Transactional Email Engine & Template System
 * Supports technology-agnostic email providers (Resend, SendGrid, Postmark, AWS SES).
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
export declare function sendTransactionalEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
}>;
export declare function renderVerificationEmailHtml(name: string, verificationUrl: string): string;
export declare function renderPasswordResetEmailHtml(name: string, resetUrl: string): string;
export declare function renderSecurityAlertEmailHtml(
  name: string,
  ipAddress: string,
  device: string,
): string;
//# sourceMappingURL=email-service.d.ts.map
