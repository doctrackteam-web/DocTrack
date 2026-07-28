export interface SearchResultItem {
  id: string;
  type: 'document' | 'folder' | 'link';
  title: string;
  subtitle?: string;
  createdAt: string;
}
export declare function globalSearchWorkspaceStore(
  workspaceId: string,
  query: string,
): SearchResultItem[];
//# sourceMappingURL=search-engine.d.ts.map
