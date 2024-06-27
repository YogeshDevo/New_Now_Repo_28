"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAllNotificationMonthly = exports.buildAllNotificationWeekly = exports.buildAllNotificationDaily = exports.buildOneNotification = exports.buildAllNotification = void 0;
const users_model_1 = require("../api/users/users.model");
const daily_1 = require("./templates/daily");
const monthly_1 = require("./templates/monthly");
const temp_1_1 = require("./templates/temp-1");
const weekly_1 = require("./templates/weekly");
async function buildAllNotification(cfr) {
    return {
        subject: cfr.activity,
        body: (0, temp_1_1.EmailTemplate)(cfr.description),
    };
}
exports.buildAllNotification = buildAllNotification;
async function buildOneNotification(cfr) {
    const user = await users_model_1.Todos.findOne({ email: cfr.email });
    if (!user)
        return null;
    return {
        subject: `${cfr.activity}`,
        body: (0, temp_1_1.EmailTemplate)(`Hi ${user.fname} ${user.lname}, ${cfr.description}`),
    };
}
exports.buildOneNotification = buildOneNotification;
async function buildAllNotificationDaily(data) {
    return {
        subject: 'Daily Notification - Due Calibrations',
        body: (0, daily_1.EmailDailyTemplate)(data),
    };
}
exports.buildAllNotificationDaily = buildAllNotificationDaily;
async function buildAllNotificationWeekly(data) {
    return {
        subject: 'Weekly Notification - Requests created last week',
        body: (0, weekly_1.EmailWeeklyTemplate)(data),
    };
}
exports.buildAllNotificationWeekly = buildAllNotificationWeekly;
async function buildAllNotificationMonthly(data) {
    return {
        subject: 'Monthly Notification - Calibration Schedule for the current month',
        body: (0, monthly_1.EmailMonthlyTemplate)(data),
    };
}
exports.buildAllNotificationMonthly = buildAllNotificationMonthly;
//# sourceMappingURL=buildNotification.js.map