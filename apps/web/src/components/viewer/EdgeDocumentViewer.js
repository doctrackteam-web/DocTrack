"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeViewerController = void 0;
class EdgeViewerController {
    state;
    lastActivityTimestamp;
    idleTimeoutMs = 10000; // 10 seconds idle threshold
    constructor(totalPages = 1) {
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
    getState() {
        return { ...this.state };
    }
    nextPage() {
        if (this.state.currentPage < this.state.totalPages) {
            this.state.currentPage += 1;
            this.recordActivity();
            this.updateScrollDepth();
        }
    }
    previousPage() {
        if (this.state.currentPage > 1) {
            this.state.currentPage -= 1;
            this.recordActivity();
        }
    }
    setZoom(zoomLevel) {
        this.state.zoomLevel = Math.min(Math.max(zoomLevel, 0.5), 2.0);
        this.state.fitMode = 'custom';
        this.recordActivity();
    }
    toggleSidebar() {
        this.state.isSidebarOpen = !this.state.isSidebarOpen;
    }
    recordActivity() {
        const now = Date.now();
        if (!this.state.isIdle) {
            this.state.activeReadingTimeMs += now - this.lastActivityTimestamp;
        }
        this.lastActivityTimestamp = now;
        this.state.isIdle = false;
    }
    checkIdleState(currentTimestamp = Date.now()) {
        if (currentTimestamp - this.lastActivityTimestamp > this.idleTimeoutMs) {
            this.state.isIdle = true;
        }
        return this.state.isIdle;
    }
    updateScrollDepth() {
        const depth = Math.round((this.state.currentPage / this.state.totalPages) * 100);
        this.state.scrollDepthPercent = Math.max(this.state.scrollDepthPercent, depth);
    }
}
exports.EdgeViewerController = EdgeViewerController;
//# sourceMappingURL=EdgeDocumentViewer.js.map