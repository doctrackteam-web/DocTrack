import {
  SignatureRequestEntity,
  SignatureFieldEntity,
  SignerParticipantEntity,
  SignatureCompletionCertificate,
} from '../domain/signature.js';
export declare function createSignatureRequestStore(
  documentId: string,
  workspaceId: string,
  ownerId: string,
  title: string,
  participants: Array<{
    email: string;
    name: string;
    signingOrder?: number;
  }>,
  fields: Array<Omit<SignatureFieldEntity, 'id'>>,
): {
  request: SignatureRequestEntity;
  signerTokens: Array<{
    email: string;
    token: string;
  }>;
};
export declare function getSignatureRequestByIdStore(
  requestId: string,
): SignatureRequestEntity | null;
export declare function getSignatureSessionByTokenStore(token: string): {
  request: SignatureRequestEntity;
  signer: SignerParticipantEntity;
} | null;
export declare function submitSignatureStore(
  token: string,
  fieldValues: Array<{
    fieldId: string;
    value: string;
  }>,
  ipAddress: string,
  userAgent: string,
): {
  success: boolean;
  isCompleted: boolean;
  certificateId?: string;
};
export declare function declineSignatureRequestStore(
  token: string,
  ipAddress: string,
  userAgent: string,
): boolean;
export declare function getCompletionCertificateStore(
  certId: string,
): SignatureCompletionCertificate | null;
export declare function clearSignatureStoreForTesting(): void;
//# sourceMappingURL=signature-store.d.ts.map
