import { submitSignatureStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const ua = request.headers.get('user-agent') || 'Unknown';

  try {
    const { token, fieldValues } = await request.json();

    if (!token) {
      return createErrorResponse('INVALID_PAYLOAD', 'Signing token is required.', 400);
    }

    const result = submitSignatureStore(token, fieldValues || [], ip, ua);

    return createSuccessResponse(
      {
        success: result.success,
        isCompleted: result.isCompleted,
        certificateId: result.certificateId || null,
      },
      200,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'SIGNING_FAILED',
      error.message || 'Signature submission failed.',
      400,
    );
  }
}
