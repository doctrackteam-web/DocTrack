"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
    Free: {
        storageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
        maxDocuments: 10,
        maxSignaturesPerMonth: 3,
        maxTeamSeats: 1,
        analyticsRetentionDays: 30,
    },
    Pro: {
        storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
        maxDocuments: 500,
        maxSignaturesPerMonth: 100,
        maxTeamSeats: 5,
        analyticsRetentionDays: 365,
    },
    Business: {
        storageBytes: 500 * 1024 * 1024 * 1024, // 500 GB
        maxDocuments: 10000,
        maxSignaturesPerMonth: 1000,
        maxTeamSeats: 25,
        analyticsRetentionDays: 1095,
    },
};
//# sourceMappingURL=billing.js.map