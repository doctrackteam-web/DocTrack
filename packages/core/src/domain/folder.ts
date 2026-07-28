export interface FolderEntity {
  id: string;
  workspaceId: string;
  parentId?: string;
  name: string;
  ownerId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function validateFolderName(name: string): { valid: boolean; reason?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, reason: 'Folder name cannot be empty.' };
  }
  if (name.length > 128) {
    return { valid: false, reason: 'Folder name cannot exceed 128 characters.' };
  }
  if (/[<>:"/\\|?*]/.test(name)) {
    return { valid: false, reason: 'Folder name contains illegal characters.' };
  }
  return { valid: true };
}
