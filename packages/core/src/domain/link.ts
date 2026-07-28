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

export function validateLinkAccess(
  link: SharingLinkEntity,
  providedPassword?: string,
): { allowed: boolean; reason?: string } {
  if (link.isRevoked) {
    return { allowed: false, reason: 'This link has been revoked by the document owner.' };
  }

  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
    return { allowed: false, reason: 'This sharing link has expired.' };
  }

  if (link.maxViews !== undefined && link.maxViews > 0 && link.currentViews >= link.maxViews) {
    return { allowed: false, reason: 'Maximum view count for this link has been reached.' };
  }

  if (link.isPasswordProtected) {
    if (!providedPassword) {
      return { allowed: false, reason: 'Password required to access this document.' };
    }
  }

  return { allowed: true };
}
