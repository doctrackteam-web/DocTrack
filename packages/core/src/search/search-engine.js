"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearchWorkspaceStore = globalSearchWorkspaceStore;
const document_store_js_1 = require("../db/document-store.js");
const folder_store_js_1 = require("../db/folder-store.js");
const link_store_js_1 = require("../db/link-store.js");
function globalSearchWorkspaceStore(workspaceId, query) {
    if (!query || query.trim().length === 0)
        return [];
    const term = query.toLowerCase().trim();
    const results = [];
    // Search Documents
    const docs = (0, document_store_js_1.listDocumentsForWorkspaceStore)(workspaceId);
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
        const links = (0, link_store_js_1.listSharingLinksForDocumentStore)(doc.id);
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
    const folders = (0, folder_store_js_1.listFoldersForWorkspaceStore)(workspaceId);
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
//# sourceMappingURL=search-engine.js.map