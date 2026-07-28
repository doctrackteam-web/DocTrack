import { generateSecureToken } from '@doctrack/security';
import { FolderEntity, validateFolderName } from '../domain/folder.js';

const foldersMap = new Map<string, FolderEntity>();

export function createFolderStore(
  workspaceId: string,
  ownerId: string,
  name: string,
  parentId?: string,
): FolderEntity {
  const check = validateFolderName(name);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid folder name.');
  }

  const folderId = `fld_${generateSecureToken(16)}`;
  const now = new Date();

  const folder: FolderEntity = {
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

export function listFoldersForWorkspaceStore(
  workspaceId: string,
  parentId?: string,
): FolderEntity[] {
  const result: FolderEntity[] = [];
  for (const f of foldersMap.values()) {
    if (f.workspaceId === workspaceId && !f.isDeleted) {
      if (parentId === undefined || f.parentId === parentId) {
        result.push(f);
      }
    }
  }
  return result;
}

export function getFolderByIdStore(folderId: string): FolderEntity | null {
  const folder = foldersMap.get(folderId);
  if (!folder || folder.isDeleted) return null;
  return folder;
}

export function softDeleteFolderStore(folderId: string, workspaceId: string): boolean {
  const folder = foldersMap.get(folderId);
  if (!folder || folder.workspaceId !== workspaceId) return false;

  folder.isDeleted = true;
  folder.updatedAt = new Date();
  return true;
}

export function clearFolderStoreForTesting(): void {
  foldersMap.clear();
}
