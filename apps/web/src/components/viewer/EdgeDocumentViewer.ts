export interface ViewerState {
  currentPage: number;
  totalPages: number;
  zoomLevel: number; // 0.5 to 2.0
  fitMode: 'width' | 'page' | 'custom';
  isSidebarOpen: boolean;
  isIdle: boolean;
  activeReadingTimeMs: number;
  scrollDepthPercent: number;
}

export class EdgeViewerController {
  private state: ViewerState;
  private lastActivityTimestamp: number;
  private idleTimeoutMs: number = 10000; // 10 seconds idle threshold

  constructor(totalPages: number = 1) {
    this.state = {
      currentPage: 1,
      totalPages: Math.max(totalPages, 1),
      zoomLevel: 1.0,
      fitMode: 'width',
      isSidebarOpen: true,
      isIdle: false,
      activeReadingTimeMs: 0,
      scrollDepthPercent: 0,
    };
    this.lastActivityTimestamp = Date.now();
  }

  getState(): ViewerState {
    return { ...this.state };
  }

  nextPage(): void {
    if (this.state.currentPage < this.state.totalPages) {
      this.state.currentPage += 1;
      this.recordActivity();
      this.updateScrollDepth();
    }
  }

  previousPage(): void {
    if (this.state.currentPage > 1) {
      this.state.currentPage -= 1;
      this.recordActivity();
    }
  }

  setZoom(zoomLevel: number): void {
    this.state.zoomLevel = Math.min(Math.max(zoomLevel, 0.5), 2.0);
    this.state.fitMode = 'custom';
    this.recordActivity();
  }

  toggleSidebar(): void {
    this.state.isSidebarOpen = !this.state.isSidebarOpen;
  }

  recordActivity(): void {
    const now = Date.now();
    if (!this.state.isIdle) {
      this.state.activeReadingTimeMs += now - this.lastActivityTimestamp;
    }
    this.lastActivityTimestamp = now;
    this.state.isIdle = false;
  }

  checkIdleState(currentTimestamp: number = Date.now()): boolean {
    if (currentTimestamp - this.lastActivityTimestamp > this.idleTimeoutMs) {
      this.state.isIdle = true;
    }
    return this.state.isIdle;
  }

  private updateScrollDepth(): void {
    const depth = Math.round((this.state.currentPage / this.state.totalPages) * 100);
    this.state.scrollDepthPercent = Math.max(this.state.scrollDepthPercent, depth);
  }
}
