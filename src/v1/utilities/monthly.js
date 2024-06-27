"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyNotificationSend = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const cal_schedule_model_1 = require("../api/calibration-schedule/cal-schedule.model");
const buildNotification_1 = require("../emails/buildNotification");
const users_model_1 = require("../api/users/users.model");
const notify_1 = require("../emails/notify");
async function MonthlyNotificationSend() {
    const reportfromDate = (0, dayjs_1.default)().startOf('month').valueOf();
    const reporttoDate = (0, dayjs_1.default)().endOf('month').valueOf();
    const calibrationSchedulesData = await cal_schedule_model_1.CalibrationSchedules.find({
        due_date: {
            ...(reportfromDate && { $gte: reportfromDate }),
            ...(reporttoDate && { $lt: reporttoDate }), // Add 24 hours to include the end date
        },
    }) // filter data between start and end timestamps
        .sort({ updated_at: -1 }) // sort the data
        .toArray();
    const notificationDataAll = await (0, buildNotification_1.buildAllNotificationMonthly)(calibrationSchedulesData);
    if (notificationDataAll && process.env.NOTIFY === 'Y') {
        const performers = await users_model_1.Todos.find({ role: 'performer' }).toArray();
        await (0, notify_1.notifyAll)(performers, notificationDataAll.subject, notificationDataAll.body);
    }
}
exports.MonthlyNotificationSend = MonthlyNotificationSend;
//# sourceMappingURL=monthly.js.map