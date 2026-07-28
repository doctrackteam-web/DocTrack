import { generateSecureToken, hashPassword } from '@doctrack/security';
import { SharingLinkEntity } from '../domain/link.js';

const linksMap = new Map<string, SharingLinkEntity>();
const linksBySlugMap = new Map<string, SharingLinkEntity>();

export function createSharingLinkStore(
  documentId: string,
  workspaceId: string,
  ownerId: string,
  options?: {
    password?: string;
    expiresAt?: Date;
    maxViews?: number;
    allowDownload?: boolean;
    customSlug?: string;
  },
): SharingLinkEntity {
  const linkId = `lnk_${generateSecureToken(16)}`;
  const slug = options?.customSlug ? options.customSlug.trim() : generateSecureToken(8);
  const now = new Date();

  if (linksBySlugMap.has(slug)) {
    throw new Error('Sharing link with this slug already exists.');
  }

  const link: SharingLinkEntity = {
    id: linkId,
    documentId,
    workspaceId,
    ownerId,
    slug,
    passwordHash: options?.password ? hashPassword(options.password) : undefined,
    isPasswordProtected: Boolean(options?.password),
    expiresAt: options?.expiresAt,
    maxViews: options?.maxViews,
    currentViews: 0,
    isRevoked: false,
    allowDownload: options?.allowDownload ?? true,
    createdAt: now,
    updatedAt: now,
  };

  linksMap.set(linkId, link);
  linksBySlugMap.set(slug, link);
  return link;
}

export function getSharingLinkByIdStore(linkId: string): SharingLinkEntity | null {
  return linksMap.get(linkId) || null;
}

export function getSharingLinkBySlugStore(slug: string): SharingLinkEntity | null {
  return linksBySlugMap.get(slug) || null;
}

export function listSharingLinksForDocumentStore(documentId: string): SharingLinkEntity[] {
  const result: SharingLinkEntity[] = [];
  for (const link of linksMap.values()) {
    if (link.documentId === documentId && !link.isRevoked) {
      result.push(link);
    }
  }
  return result;
}

export function incrementLinkViewsStore(linkId: string): void {
  const link = linksMap.get(linkId);
  if (link) {
    link.currentViews += 1;
    link.updatedAt = new Date();
  }
}

export function revokeSharingLinkStore(linkId: string, workspaceId: string): boolean {
  const link = linksMap.get(linkId);
  if (!link || link.workspaceId !== workspaceId) return false;

  link.isRevoked = true;
  link.updatedAt = new Date();
  return true;
}

export function clearLinkStoreForTesting(): void {
  linksMap.clear();
  linksBySlugMap.clear();
}
