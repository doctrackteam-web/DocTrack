export declare function createSuccessResponse<T>(
  data: T,
  status?: number,
  customHeaders?: Record<string, string>,
): Response;
export declare function createErrorResponse(
  code: string,
  message: string,
  status?: number,
  details?: Record<string, unknown>,
): Response;
//# sourceMappingURL=api-response.d.ts.map
