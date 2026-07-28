import { getCompletionCertificateStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../../lib/api-response.js';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const certId = params.id;
  const cert = getCompletionCertificateStore(certId);

  if (!cert) {
    return createErrorResponse('NOT_FOUND', 'Completion certificate not found.', 404);
  }

  return createSuccessResponse({ certificate: cert }, 200);
}
