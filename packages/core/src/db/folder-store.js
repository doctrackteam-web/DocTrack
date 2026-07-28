"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolderStore = createFolderStore;
exports.listFoldersForWorkspaceStore = listFoldersForWorkspaceStore;
exports.getFolderByIdStore = getFolderByIdStore;
exports.softDeleteFolderStore = softDeleteFolderStore;
exports.clearFolderStoreForTesting = clearFolderStoreForTesting;
const security_1 = require("@doctrack/security");
const folder_js_1 = require("../domain/folder.js");
const foldersMap = new Map();
function createFolderStore(workspaceId, ownerId, name, parentId) {
    const check = (0, folder_js_1.validateFolderName)(name);
    if (!check.valid) {
        throw new Error(check.reason || 'Invalid folder name.');
    }
    const folderId = `fld_${(0, security_1.generateSecureToken)(16)}`;
    const now = new Date();
    const folder = {
        id: folderId,
        workspaceId,
        parentId,
        name: name.trim(),
        ownerId,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
    foldersMap.set(folderId, folder);
    return folder;
}
function listFoldersForWorkspaceStore(workspaceId, parentId) {
    const result = [];
    for (const f of foldersMap.values()) {
        if (f.workspaceId === workspaceId && !f.isDeleted) {
            if (parentId === undefined || f.parentId === parentId) {
                result.push(f);
            }
        }
    }
    return result;
}
function getFolderByIdStore(folderId) {
    const folder = foldersMap.get(folderId);
    if (!folder || folder.isDeleted)
        return null;
    return folder;
}
function softDeleteFolderStore(folderId, workspaceId) {
    const folder = foldersMap.get(folderId);
    if (!folder || folder.workspaceId !== workspaceId)
        return false;
    folder.isDeleted = true;
    folder.updatedAt = new Date();
    return true;
}
function clearFolderStoreForTesting() {
    foldersMap.clear();
}
//# sourceMappingURL=folder-store.js.map