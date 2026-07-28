export type SignatureFieldType = 'signature' | 'initial' | 'date' | 'text' | 'checkbox';
export interface SignatureFieldEntity {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  fieldType: SignatureFieldType;
  assignedSignerEmail: string;
  value?: string;
}
export interface SignerParticipantEntity {
  id: string;
  email: string;
  name: string;
  signingOrder: number;
  status: 'Pending' | 'Sent' | 'Signed' | 'Declined';
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}
export interface SignatureRequestEntity {
  id: string;
  documentId: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Declined' | 'Expired';
  participants: SignerParticipantEntity[];
  fields: SignatureFieldEntity[];
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface SignatureAuditTrailEvent {
  id: string;
  requestId: string;
  action: 'CREATED' | 'VIEWED' | 'SIGNED' | 'COMPLETED' | 'DECLINED';
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  previousHash: string;
  hash: string;
}
export interface SignatureCompletionCertificate {
  id: string;
  requestId: string;
  documentId: string;
  documentHash: string;
  participants: SignerParticipantEntity[];
  auditTrail: SignatureAuditTrailEvent[];
  completedAt: Date;
}
//# sourceMappingURL=signature.d.ts.map
