import { FolderEntity } from '../domain/folder.js';
export declare function createFolderStore(
  workspaceId: string,
  ownerId: string,
  name: string,
  parentId?: string,
): FolderEntity;
export declare function listFoldersForWorkspaceStore(
  workspaceId: string,
  parentId?: string,
): FolderEntity[];
export declare function getFolderByIdStore(folderId: string): FolderEntity | null;
export declare function softDeleteFolderStore(folderId: string, workspaceId: string): boolean;
export declare function clearFolderStoreForTesting(): void;
//# sourceMappingURL=folder-store.d.ts.map
