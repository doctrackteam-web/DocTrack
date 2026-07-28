import { DocumentEntity, DocumentProcessingStatus } from '../domain/document.js';
export declare function createDocumentStore(
  workspaceId: string,
  ownerId: string,
  title: string,
  fileKey: string,
  fileSize: number,
  mimeType?: string,
  fileHash?: string,
): DocumentEntity;
export declare function getDocumentByIdStore(docId: string): DocumentEntity | null;
export declare function listDocumentsForWorkspaceStore(workspaceId: string): DocumentEntity[];
export declare function updateDocumentStatusStore(
  docId: string,
  targetStatus: DocumentProcessingStatus,
  metadata?: {
    pageCount?: number;
    processingError?: string;
  },
): DocumentEntity;
export declare function softDeleteDocumentStore(docId: string, workspaceId: string): boolean;
export declare function clearDocumentStoreForTesting(): void;
//# sourceMappingURL=document-store.d.ts.map
