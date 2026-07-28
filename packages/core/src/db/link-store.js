"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSharingLinkStore = createSharingLinkStore;
exports.getSharingLinkByIdStore = getSharingLinkByIdStore;
exports.getSharingLinkBySlugStore = getSharingLinkBySlugStore;
exports.listSharingLinksForDocumentStore = listSharingLinksForDocumentStore;
exports.incrementLinkViewsStore = incrementLinkViewsStore;
exports.revokeSharingLinkStore = revokeSharingLinkStore;
exports.clearLinkStoreForTesting = clearLinkStoreForTesting;
const security_1 = require("@doctrack/security");
const linksMap = new Map();
const linksBySlugMap = new Map();
function createSharingLinkStore(documentId, workspaceId, ownerId, options) {
    const linkId = `lnk_${(0, security_1.generateSecureToken)(16)}`;
    const slug = options?.customSlug ? options.customSlug.trim() : (0, security_1.generateSecureToken)(8);
    const now = new Date();
    if (linksBySlugMap.has(slug)) {
        throw new Error('Sharing link with this slug already exists.');
    }
    const link = {
        id: linkId,
        documentId,
        workspaceId,
        ownerId,
        slug,
        passwordHash: options?.password ? (0, security_1.hashPassword)(options.password) : undefined,
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
function getSharingLinkByIdStore(linkId) {
    return linksMap.get(linkId) || null;
}
function getSharingLinkBySlugStore(slug) {
    return linksBySlugMap.get(slug) || null;
}
function listSharingLinksForDocumentStore(documentId) {
    const result = [];
    for (const link of linksMap.values()) {
        if (link.documentId === documentId && !link.isRevoked) {
            result.push(link);
        }
    }
    return result;
}
function incrementLinkViewsStore(linkId) {
    const link = linksMap.get(linkId);
    if (link) {
        link.currentViews += 1;
        link.updatedAt = new Date();
    }
}
function revokeSharingLinkStore(linkId, workspaceId) {
    const link = linksMap.get(linkId);
    if (!link || link.workspaceId !== workspaceId)
        return false;
    link.isRevoked = true;
    link.updatedAt = new Date();
    return true;
}
function clearLinkStoreForTesting() {
    linksMap.clear();
    linksBySlugMap.clear();
}
//# sourceMappingURL=link-store.js.map