"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCron = void 0;
const cron = require('node-cron');
const daily_1 = require("./daily");
const weekly_1 = require("./weekly");
const monthly_1 = require("./monthly");
async function startCron() {
    cron.schedule('0 0 * * *', () => {
        (0, daily_1.dailyNotificationSend)();
    });
    cron.schedule('0 0 * * 0', () => {
        (0, weekly_1.WeeklyNotificationSend)();
    });
    cron.schedule('0 0 1 * *', () => {
        (0, monthly_1.MonthlyNotificationSend)();
    });
    // this is for testing the cron 
    if (process.env.TEST_CRON === 'Y') {
        cron.schedule('*/5 * * * *', () => {
            (0, monthly_1.MonthlyNotificationSend)();
            (0, weekly_1.WeeklyNotificationSend)();
            (0, daily_1.dailyNotificationSend)();
        });
    }
}
exports.startCron = startCron;
//# sourceMappingURL=cron.js.map