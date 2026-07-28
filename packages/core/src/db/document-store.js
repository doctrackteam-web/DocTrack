"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocumentStore = createDocumentStore;
exports.getDocumentByIdStore = getDocumentByIdStore;
exports.listDocumentsForWorkspaceStore = listDocumentsForWorkspaceStore;
exports.updateDocumentStatusStore = updateDocumentStatusStore;
exports.softDeleteDocumentStore = softDeleteDocumentStore;
exports.clearDocumentStoreForTesting = clearDocumentStoreForTesting;
const security_1 = require("@doctrack/security");
const document_js_1 = require("../domain/document.js");
const documentsMap = new Map();
function createDocumentStore(workspaceId, ownerId, title, fileKey, fileSize, mimeType = 'application/pdf', fileHash = '') {
    const docId = `doc_${(0, security_1.generateSecureToken)(16)}`;
    const now = new Date();
    const doc = {
        id: docId,
        workspaceId,
        ownerId,
        title: title.trim(),
        fileKey,
        fileSize,
        mimeType,
        fileHash,
        pageCount: 0,
        status: 'Uploading',
        version: 1,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
    documentsMap.set(docId, doc);
    return doc;
}
function getDocumentByIdStore(docId) {
    const doc = documentsMap.get(docId);
    if (!doc || doc.isDeleted)
        return null;
    return doc;
}
function listDocumentsForWorkspaceStore(workspaceId) {
    const result = [];
    for (const doc of documentsMap.values()) {
        if (doc.workspaceId === workspaceId && !doc.isDeleted) {
            result.push(doc);
        }
    }
    return result;
}
function updateDocumentStatusStore(docId, targetStatus, metadata) {
    const doc = documentsMap.get(docId);
    if (!doc) {
        throw new Error(`Document ${docId} not found.`);
    }
    if (!(0, document_js_1.canTransitionStatus)(doc.status, targetStatus)) {
        throw new Error(`Invalid status transition from ${doc.status} to ${targetStatus}.`);
    }
    doc.status = targetStatus;
    if (metadata?.pageCount !== undefined)
        doc.pageCount = metadata.pageCount;
    if (metadata?.processingError !== undefined)
        doc.processingError = metadata.processingError;
    doc.updatedAt = new Date();
    return doc;
}
function softDeleteDocumentStore(docId, workspaceId) {
    const doc = documentsMap.get(docId);
    if (!doc || doc.workspaceId !== workspaceId)
        return false;
    doc.isDeleted = true;
    doc.status = 'Deleted';
    doc.updatedAt = new Date();
    return true;
}
function clearDocumentStoreForTesting() {
    documentsMap.clear();
}
//# sourceMappingURL=document-store.js.map