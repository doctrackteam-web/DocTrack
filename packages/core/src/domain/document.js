"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransitionStatus = canTransitionStatus;
const ALLOWED_TRANSITIONS = {
    Uploading: ['Uploaded', 'Failed', 'Deleted'],
    Uploaded: ['Processing', 'Failed', 'Deleted'],
    Processing: ['Ready', 'Failed', 'Deleted'],
    Ready: ['Archived', 'Deleted', 'Uploading'], // Uploading allows new version upload
    Failed: ['Processing', 'Deleted'],
    Archived: ['Ready', 'Deleted'],
    Deleted: [],
};
function canTransitionStatus(currentStatus, targetStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
}
//# sourceMappingURL=document.js.map