export interface LogContext {
  requestId?: string;
  userId?: string;
  workspaceId?: string;
  route?: string;
  latencyMs?: number;
  statusCode?: number;
  errorCode?: string;
  [key: string]: unknown;
}

export class Logger {
  private static sanitize(obj: Record<string, unknown>): Record<string, unknown> {
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

  static info(message: string, context: LogContext = {}): void {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...this.sanitize(context),
    };
    console.log(JSON.stringify(payload));
  }

  static error(message: string, error?: Error | unknown, context: LogContext = {}): void {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : String(error),
      ...this.sanitize(context),
    };
    console.error(JSON.stringify(payload));
  }

  static captureException(error: Error | unknown, context: LogContext = {}): void {
    this.error('Unhandled Exception Captured', error, context);
    // Sentry / OpenTelemetry Hook
    if (process.env.SENTRY_DSN) {
      // Dispatch to Sentry Sdk if configured
    }
  }
}
