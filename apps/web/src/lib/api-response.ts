import { ApiResponse } from '@doctrack/contracts';

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  customHeaders?: Record<string, string>,
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
    },
  };

  const headers = new Headers({ 'Content-Type': 'application/json', ...customHeaders });

  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>,
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}
