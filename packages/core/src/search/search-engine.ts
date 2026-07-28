import { listDocumentsForWorkspaceStore } from '../db/document-store.js';
import { listFoldersForWorkspaceStore } from '../db/folder-store.js';
import { listSharingLinksForDocumentStore } from '../db/link-store.js';

export interface SearchResultItem {
  id: string;
  type: 'document' | 'folder' | 'link';
  title: string;
  subtitle?: string;
  createdAt: string;
}

export function globalSearchWorkspaceStore(workspaceId: string, query: string): SearchResultItem[] {
  if (!query || query.trim().length === 0) return [];
  const term = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // Search Documents
  const docs = listDocumentsForWorkspaceStore(workspaceId);
  for (const doc of docs) {
    if (doc.title.toLowerCase().includes(term)) {
      results.push({
        id: doc.id,
        type: 'document',
        title: doc.title,
        subtitle: `${doc.pageCount} pages • ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
        createdAt: doc.createdAt.toISOString(),
      });
    }

    // Search Links belonging to document
    const links = listSharingLinksForDocumentStore(doc.id);
    for (const link of links) {
      if (link.slug.toLowerCase().includes(term)) {
        results.push({
          id: link.id,
          type: 'link',
          title: `/v/${link.slug}`,
          subtitle: `Link for "${doc.title}"`,
          createdAt: link.createdAt.toISOString(),
        });
      }
    }
  }

  // Search Folders
  const folders = listFoldersForWorkspaceStore(workspaceId);
  for (const folder of folders) {
    if (folder.name.toLowerCase().includes(term)) {
      results.push({
        id: folder.id,
        type: 'folder',
        title: folder.name,
        subtitle: 'Folder',
        createdAt: folder.createdAt.toISOString(),
      });
    }
  }

  return results;
}
