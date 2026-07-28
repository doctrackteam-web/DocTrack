"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function GET() {
    return (0, api_response_js_1.createSuccessResponse)({
        plans: [
            {
                tier: 'Free',
                name: 'Free Starter',
                priceMonthly: 0,
                priceYearly: 0,
                limits: core_1.PLAN_LIMITS.Free,
            },
            {
                tier: 'Pro',
                name: 'Pro Professional',
                priceMonthly: 29,
                priceYearly: 290,
                limits: core_1.PLAN_LIMITS.Pro,
            },
            {
                tier: 'Business',
                name: 'Business Enterprise',
                priceMonthly: 99,
                priceYearly: 990,
                limits: core_1.PLAN_LIMITS.Business,
            },
        ],
    }, 200);
}
//# sourceMappingURL=route.js.map