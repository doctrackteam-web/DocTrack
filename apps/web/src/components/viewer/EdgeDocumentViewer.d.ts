export interface ViewerState {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  fitMode: 'width' | 'page' | 'custom';
  isSidebarOpen: boolean;
  isIdle: boolean;
  activeReadingTimeMs: number;
  scrollDepthPercent: number;
}
export declare class EdgeViewerController {
  private state;
  private lastActivityTimestamp;
  private idleTimeoutMs;
  constructor(totalPages?: number);
  getState(): ViewerState;
  nextPage(): void;
  previousPage(): void;
  setZoom(zoomLevel: number): void;
  toggleSidebar(): void;
  recordActivity(): void;
  checkIdleState(currentTimestamp?: number): boolean;
  private updateScrollDepth;
}
//# sourceMappingURL=EdgeDocumentViewer.d.ts.map
