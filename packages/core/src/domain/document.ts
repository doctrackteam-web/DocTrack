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

const ALLOWED_TRANSITIONS: Record<DocumentProcessingStatus, DocumentProcessingStatus[]> = {
  Uploading: ['Uploaded', 'Failed', 'Deleted'],
  Uploaded: ['Processing', 'Failed', 'Deleted'],
  Processing: ['Ready', 'Failed', 'Deleted'],
  Ready: ['Archived', 'Deleted', 'Uploading'], // Uploading allows new version upload
  Failed: ['Processing', 'Deleted'],
  Archived: ['Ready', 'Deleted'],
  Deleted: [],
};

export function canTransitionStatus(
  currentStatus: DocumentProcessingStatus,
  targetStatus: DocumentProcessingStatus,
): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}
