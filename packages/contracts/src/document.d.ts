export interface CreateDocumentUploadRequest {
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
export interface CreateDocumentUploadResponse {
  documentId: string;
  fileKey: string;
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
}
export interface CompleteDocumentUploadRequest {
  documentId: string;
  fileHash?: string;
}
export interface DocumentDTO {
  id: string;
  workspaceId: string;
  title: string;
  fileSize: number;
  pageCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
//# sourceMappingURL=document.d.ts.map
