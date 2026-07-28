import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  getSubscriptionForWorkspaceStore,
  PLAN_LIMITS,
  listDocumentsForWorkspaceStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
  if (!workspace) {
    return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
  }

  const subscription = getSubscriptionForWorkspaceStore(workspace.id, sessionData.user.id);
  const docs = listDocumentsForWorkspaceStore(workspace.id);
  const storageUsedBytes = docs.reduce((acc, d) => acc + d.fileSize, 0);

  const limits = PLAN_LIMITS[subscription.planTier];
  const isBillingEnabled = process.env.BILLING_ENABLED === 'true';

  return createSuccessResponse(
    {
      isBillingEnabled,
      isBeta: !isBillingEnabled,
      betaNotice: !isBillingEnabled ? 'Beta – Payments Coming Soon' : null,
      subscription: {
        id: subscription.id,
        planTier: isBillingEnabled ? subscription.planTier : 'Pro',
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      },
      usage: {
        documentCount: docs.length,
        maxDocuments: isBillingEnabled ? limits.maxDocuments : PLAN_LIMITS.Pro.maxDocuments,
        storageUsedBytes,
        maxStorageBytes: isBillingEnabled ? limits.storageBytes : PLAN_LIMITS.Pro.storageBytes,
        storageUsedMb: (storageUsedBytes / 1024 / 1024).toFixed(2),
        maxStorageGb: Math.round(
          (isBillingEnabled ? limits.storageBytes : PLAN_LIMITS.Pro.storageBytes) /
            1024 /
            1024 /
            1024,
        ),
      },
    },
    200,
  );
}
