"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFolderName = validateFolderName;
function validateFolderName(name) {
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
//# sourceMappingURL=folder.js.map