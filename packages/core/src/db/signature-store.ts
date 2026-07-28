import { createHash } from 'crypto';
import { generateSecureToken } from '@doctrack/security';
import {
  SignatureRequestEntity,
  SignatureFieldEntity,
  SignerParticipantEntity,
  SignatureAuditTrailEvent,
  SignatureCompletionCertificate,
} from '../domain/signature.js';

const requestsMap = new Map<string, SignatureRequestEntity>();
const tokensToRequestIdMap = new Map<string, { requestId: string; signerEmail: string }>();
const auditTrailsMap = new Map<string, SignatureAuditTrailEvent[]>();
const certificatesMap = new Map<string, SignatureCompletionCertificate>();

export function createSignatureRequestStore(
  documentId: string,
  workspaceId: string,
  ownerId: string,
  title: string,
  participants: Array<{ email: string; name: string; signingOrder?: number }>,
  fields: Array<Omit<SignatureFieldEntity, 'id'>>,
): { request: SignatureRequestEntity; signerTokens: Array<{ email: string; token: string }> } {
  const requestId = `sig_${generateSecureToken(16)}`;
  const now = new Date();

  const formattedParticipants: SignerParticipantEntity[] = participants.map((p, idx) => ({
    id: `part_${generateSecureToken(8)}`,
    email: p.email.toLowerCase().trim(),
    name: p.name.trim(),
    signingOrder: p.signingOrder || idx + 1,
    status: 'Pending',
  }));

  const formattedFields: SignatureFieldEntity[] = fields.map((f) => ({
    ...f,
    id: `fld_${generateSecureToken(8)}`,
  }));

  const request: SignatureRequestEntity = {
    id: requestId,
    documentId,
    workspaceId,
    ownerId,
    title: title.trim(),
    status: 'Pending',
    participants: formattedParticipants,
    fields: formattedFields,
    createdAt: now,
    updatedAt: now,
  };

  requestsMap.set(requestId, request);

  // Generate unique signing tokens per signer
  const signerTokens: Array<{ email: string; token: string }> = [];
  for (const p of formattedParticipants) {
    const token = generateSecureToken(24);
    tokensToRequestIdMap.set(token, { requestId, signerEmail: p.email });
    signerTokens.push({ email: p.email, token });
  }

  // Record initial CREATED audit trail event with genesis hash
  recordAuditTrailEvent(
    requestId,
    'CREATED',
    'system@doctrack.com',
    '127.0.0.1',
    'Server Internal',
  );

  return { request, signerTokens };
}

export function getSignatureRequestByIdStore(requestId: string): SignatureRequestEntity | null {
  return requestsMap.get(requestId) || null;
}

export function getSignatureSessionByTokenStore(token: string): {
  request: SignatureRequestEntity;
  signer: SignerParticipantEntity;
} | null {
  const meta = tokensToRequestIdMap.get(token);
  if (!meta) return null;

  const request = requestsMap.get(meta.requestId);
  if (!request) return null;

  const signer = request.participants.find((p) => p.email === meta.signerEmail);
  if (!signer) return null;

  return { request, signer };
}

export function submitSignatureStore(
  token: string,
  fieldValues: Array<{ fieldId: string; value: string }>,
  ipAddress: string,
  userAgent: string,
): { success: boolean; isCompleted: boolean; certificateId?: string } {
  const session = getSignatureSessionByTokenStore(token);
  if (!session) {
    throw new Error('Invalid or expired signing token.');
  }

  const { request, signer } = session;

  if (request.status === 'Completed' || request.status === 'Declined') {
    throw new Error(`Signature request is already ${request.status.toLowerCase()}.`);
  }

  // Update field values assigned to signer
  for (const fv of fieldValues) {
    const targetField = request.fields.find(
      (f) => f.id === fv.fieldId && f.assignedSignerEmail === signer.email,
    );
    if (targetField) {
      targetField.value = fv.value;
    }
  }

  signer.status = 'Signed';
  signer.signedAt = new Date();
  signer.ipAddress = ipAddress;
  signer.userAgent = userAgent;

  recordAuditTrailEvent(request.id, 'SIGNED', signer.email, ipAddress, userAgent);

  // Check if all signers have completed
  const allSigned = request.participants.every((p) => p.status === 'Signed');

  if (allSigned) {
    request.status = 'Completed';
    recordAuditTrailEvent(request.id, 'COMPLETED', signer.email, ipAddress, userAgent);

    // Generate Completion Certificate with immutable SHA-256 hash chain
    const cert = generateCompletionCertificate(request);
    request.certificateId = cert.id;
    request.updatedAt = new Date();
    return { success: true, isCompleted: true, certificateId: cert.id };
  }

  request.status = 'InProgress';
  request.updatedAt = new Date();
  return { success: true, isCompleted: false };
}

export function declineSignatureRequestStore(
  token: string,
  ipAddress: string,
  userAgent: string,
): boolean {
  const session = getSignatureSessionByTokenStore(token);
  if (!session) return false;

  const { request, signer } = session;
  signer.status = 'Declined';
  request.status = 'Declined';
  request.updatedAt = new Date();

  recordAuditTrailEvent(request.id, 'DECLINED', signer.email, ipAddress, userAgent);
  return true;
}

export function getCompletionCertificateStore(
  certId: string,
): SignatureCompletionCertificate | null {
  return certificatesMap.get(certId) || null;
}

function recordAuditTrailEvent(
  requestId: string,
  action: SignatureAuditTrailEvent['action'],
  actorEmail: string,
  ipAddress: string,
  userAgent: string,
): SignatureAuditTrailEvent {
  const events = auditTrailsMap.get(requestId) || [];
  const previousHash =
    events.length > 0
      ? events[events.length - 1]!.hash
      : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date();

  const rawPayload = `${requestId}|${action}|${actorEmail}|${ipAddress}|${timestamp.toISOString()}|${previousHash}`;
  const hash = createHash('sha256').update(rawPayload).digest('hex');

  const event: SignatureAuditTrailEvent = {
    id: `evtsig_${generateSecureToken(12)}`,
    requestId,
    action,
    actorEmail,
    ipAddress,
    userAgent,
    timestamp,
    previousHash,
    hash,
  };

  events.push(event);
  auditTrailsMap.set(requestId, events);
  return event;
}

function generateCompletionCertificate(
  request: SignatureRequestEntity,
): SignatureCompletionCertificate {
  const certId = `cert_${generateSecureToken(16)}`;
  const auditTrail = auditTrailsMap.get(request.id) || [];
  const docHash = createHash('sha256')
    .update(request.id + request.documentId)
    .digest('hex');

  const cert: SignatureCompletionCertificate = {
    id: certId,
    requestId: request.id,
    documentId: request.documentId,
    documentHash: docHash,
    participants: request.participants,
    auditTrail,
    completedAt: new Date(),
  };

  certificatesMap.set(certId, cert);
  return cert;
}

export function clearSignatureStoreForTesting(): void {
  requestsMap.clear();
  tokensToRequestIdMap.clear();
  auditTrailsMap.clear();
  certificatesMap.clear();
}
