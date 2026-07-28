import { declineSignatureRequestStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const ua = request.headers.get('user-agent') || 'Unknown';

  try {
    const { token } = await request.json();

    if (!token) {
      return createErrorResponse('INVALID_PAYLOAD', 'Signing token is required.', 400);
    }

    const success = declineSignatureRequestStore(token, ip, ua);
    if (!success) {
      return createErrorResponse('NOT_FOUND', 'Signing session not found or expired.', 404);
    }

    return createSuccessResponse({ success: true, status: 'Declined' }, 200);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('DECLINE_FAILED', error.message || 'Decline operation failed.', 400);
  }
}
