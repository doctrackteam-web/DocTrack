export type DocumentProcessingStatus =
  'Uploading' | 'Uploaded' | 'Processing' | 'Ready' | 'Failed' | 'Archived' | 'Deleted';
export interface DocumentEntity {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  pageCount: number;
  status: DocumentProcessingStatus;
  processingError?: string;
  version: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface DocumentVersionEntity {
  id: string;
  documentId: string;
  versionNumber: number;
  fileKey: string;
  fileSize: number;
  fileHash: string;
  createdAt: Date;
}
export declare function canTransitionStatus(
  currentStatus: DocumentProcessingStatus,
  targetStatus: DocumentProcessingStatus,
): boolean;
//# sourceMappingURL=document.d.ts.map
