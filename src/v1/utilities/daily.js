"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyNotificationSend = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const cal_schedule_model_1 = require("../api/calibration-schedule/cal-schedule.model");
const buildNotification_1 = require("../emails/buildNotification");
const users_model_1 = require("../api/users/users.model");
const notify_1 = require("../emails/notify");
async function dailyNotificationSend() {
    const reportfromDate = (0, dayjs_1.default)().subtract(20, 'days').startOf('day').valueOf();
    const reporttoDate = (0, dayjs_1.default)().subtract(20, 'days').endOf('day').valueOf();
    const calibrationSchedulesData = await cal_schedule_model_1.CalibrationSchedules.find({
        frequency: 'HY',
        due_date: {
            ...(reportfromDate && { $gte: reportfromDate }),
            ...(reporttoDate && { $lt: reporttoDate }), // Add 24 hours to include the end date
        },
    }) // filter data between start and end timestamps
        .sort({ updated_at: -1 }) // sort the data
        .toArray();
    const notificationDataAll = await (0, buildNotification_1.buildAllNotificationDaily)(calibrationSchedulesData);
    if (notificationDataAll && process.env.NOTIFY === 'Y') {
        const performers = await users_model_1.Todos.find({ role: 'performer' }).toArray();
        await (0, notify_1.notifyAll)(performers, notificationDataAll.subject, notificationDataAll.body);
    }
}
exports.dailyNotificationSend = dailyNotificationSend;
//# sourceMappingURL=daily.js.map