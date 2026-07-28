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
export declare class Logger {
  private static sanitize;
  static info(message: string, context?: LogContext): void;
  static error(message: string, error?: Error | unknown, context?: LogContext): void;
  static captureException(error: Error | unknown, context?: LogContext): void;
}
//# sourceMappingURL=logger.d.ts.map
