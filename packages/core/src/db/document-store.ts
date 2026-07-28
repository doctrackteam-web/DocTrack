import { generateSecureToken } from '@doctrack/security';
import {
  DocumentEntity,
  DocumentProcessingStatus,
  canTransitionStatus,
} from '../domain/document.js';

const documentsMap = new Map<string, DocumentEntity>();

export function createDocumentStore(
  workspaceId: string,
  ownerId: string,
  title: string,
  fileKey: string,
  fileSize: number,
  mimeType: string = 'application/pdf',
  fileHash: string = '',
): DocumentEntity {
  const docId = `doc_${generateSecureToken(16)}`;
  const now = new Date();

  const doc: DocumentEntity = {
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

export function getDocumentByIdStore(docId: string): DocumentEntity | null {
  const doc = documentsMap.get(docId);
  if (!doc || doc.isDeleted) return null;
  return doc;
}

export function listDocumentsForWorkspaceStore(workspaceId: string): DocumentEntity[] {
  const result: DocumentEntity[] = [];
  for (const doc of documentsMap.values()) {
    if (doc.workspaceId === workspaceId && !doc.isDeleted) {
      result.push(doc);
    }
  }
  return result;
}

export function updateDocumentStatusStore(
  docId: string,
  targetStatus: DocumentProcessingStatus,
  metadata?: { pageCount?: number; processingError?: string },
): DocumentEntity {
  const doc = documentsMap.get(docId);
  if (!doc) {
    throw new Error(`Document ${docId} not found.`);
  }

  if (!canTransitionStatus(doc.status, targetStatus)) {
    throw new Error(`Invalid status transition from ${doc.status} to ${targetStatus}.`);
  }

  doc.status = targetStatus;
  if (metadata?.pageCount !== undefined) doc.pageCount = metadata.pageCount;
  if (metadata?.processingError !== undefined) doc.processingError = metadata.processingError;
  doc.updatedAt = new Date();

  return doc;
}

export function softDeleteDocumentStore(docId: string, workspaceId: string): boolean {
  const doc = documentsMap.get(docId);
  if (!doc || doc.workspaceId !== workspaceId) return false;

  doc.isDeleted = true;
  doc.status = 'Deleted';
  doc.updatedAt = new Date();
  return true;
}

export function clearDocumentStoreForTesting(): void {
  documentsMap.clear();
}
