import { SharingLinkEntity } from '../domain/link.js';
export declare function createSharingLinkStore(
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
): SharingLinkEntity;
export declare function getSharingLinkByIdStore(linkId: string): SharingLinkEntity | null;
export declare function getSharingLinkBySlugStore(slug: string): SharingLinkEntity | null;
export declare function listSharingLinksForDocumentStore(documentId: string): SharingLinkEntity[];
export declare function incrementLinkViewsStore(linkId: string): void;
export declare function revokeSharingLinkStore(linkId: string, workspaceId: string): boolean;
export declare function clearLinkStoreForTesting(): void;
//# sourceMappingURL=link-store.d.ts.map
