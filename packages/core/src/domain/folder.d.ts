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
export declare function validateFolderName(name: string): {
  valid: boolean;
  reason?: string;
};
//# sourceMappingURL=folder.d.ts.map
