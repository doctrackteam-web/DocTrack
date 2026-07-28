"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignatureRequestStore = createSignatureRequestStore;
exports.getSignatureRequestByIdStore = getSignatureRequestByIdStore;
exports.getSignatureSessionByTokenStore = getSignatureSessionByTokenStore;
exports.submitSignatureStore = submitSignatureStore;
exports.declineSignatureRequestStore = declineSignatureRequestStore;
exports.getCompletionCertificateStore = getCompletionCertificateStore;
exports.clearSignatureStoreForTesting = clearSignatureStoreForTesting;
const crypto_1 = require("crypto");
const security_1 = require("@doctrack/security");
const requestsMap = new Map();
const tokensToRequestIdMap = new Map();
const auditTrailsMap = new Map();
const certificatesMap = new Map();
function createSignatureRequestStore(documentId, workspaceId, ownerId, title, participants, fields) {
    const requestId = `sig_${(0, security_1.generateSecureToken)(16)}`;
    const now = new Date();
    const formattedParticipants = participants.map((p, idx) => ({
        id: `part_${(0, security_1.generateSecureToken)(8)}`,
        email: p.email.toLowerCase().trim(),
        name: p.name.trim(),
        signingOrder: p.signingOrder || idx + 1,
        status: 'Pending',
    }));
    const formattedFields = fields.map((f) => ({
        ...f,
        id: `fld_${(0, security_1.generateSecureToken)(8)}`,
    }));
    const request = {
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
    const signerTokens = [];
    for (const p of formattedParticipants) {
        const token = (0, security_1.generateSecureToken)(24);
        tokensToRequestIdMap.set(token, { requestId, signerEmail: p.email });
        signerTokens.push({ email: p.email, token });
    }
    // Record initial CREATED audit trail event with genesis hash
    recordAuditTrailEvent(requestId, 'CREATED', 'system@doctrack.com', '127.0.0.1', 'Server Internal');
    return { request, signerTokens };
}
function getSignatureRequestByIdStore(requestId) {
    return requestsMap.get(requestId) || null;
}
function getSignatureSessionByTokenStore(token) {
    const meta = tokensToRequestIdMap.get(token);
    if (!meta)
        return null;
    const request = requestsMap.get(meta.requestId);
    if (!request)
        return null;
    const signer = request.participants.find((p) => p.email === meta.signerEmail);
    if (!signer)
        return null;
    return { request, signer };
}
function submitSignatureStore(token, fieldValues, ipAddress, userAgent) {
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
        const targetField = request.fields.find((f) => f.id === fv.fieldId && f.assignedSignerEmail === signer.email);
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
function declineSignatureRequestStore(token, ipAddress, userAgent) {
    const session = getSignatureSessionByTokenStore(token);
    if (!session)
        return false;
    const { request, signer } = session;
    signer.status = 'Declined';
    request.status = 'Declined';
    request.updatedAt = new Date();
    recordAuditTrailEvent(request.id, 'DECLINED', signer.email, ipAddress, userAgent);
    return true;
}
function getCompletionCertificateStore(certId) {
    return certificatesMap.get(certId) || null;
}
function recordAuditTrailEvent(requestId, action, actorEmail, ipAddress, userAgent) {
    const events = auditTrailsMap.get(requestId) || [];
    const previousHash = events.length > 0
        ? events[events.length - 1].hash
        : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date();
    const rawPayload = `${requestId}|${action}|${actorEmail}|${ipAddress}|${timestamp.toISOString()}|${previousHash}`;
    const hash = (0, crypto_1.createHash)('sha256').update(rawPayload).digest('hex');
    const event = {
        id: `evtsig_${(0, security_1.generateSecureToken)(12)}`,
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
function generateCompletionCertificate(request) {
    const certId = `cert_${(0, security_1.generateSecureToken)(16)}`;
    const auditTrail = auditTrailsMap.get(request.id) || [];
    const docHash = (0, crypto_1.createHash)('sha256')
        .update(request.id + request.documentId)
        .digest('hex');
    const cert = {
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
function clearSignatureStoreForTesting() {
    requestsMap.clear();
    tokensToRequestIdMap.clear();
    auditTrailsMap.clear();
    certificatesMap.clear();
}
//# sourceMappingURL=signature-store.js.map