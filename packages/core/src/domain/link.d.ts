export interface SharingLinkEntity {
  id: string;
  documentId: string;
  workspaceId: string;
  ownerId: string;
  slug: string;
  passwordHash?: string;
  isPasswordProtected: boolean;
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  isRevoked: boolean;
  allowDownload: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export declare function validateLinkAccess(
  link: SharingLinkEntity,
  providedPassword?: string,
): {
  allowed: boolean;
  reason?: string;
};
//# sourceMappingURL=link.d.ts.map
