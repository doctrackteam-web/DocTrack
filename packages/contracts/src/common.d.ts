export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}
//# sourceMappingURL=common.d.ts.map
