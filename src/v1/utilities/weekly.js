"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyNotificationSend = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const buildNotification_1 = require("../emails/buildNotification");
const ins_request_model_1 = require("../api/instrument_request/ins-request.model");
const users_model_1 = require("../api/users/users.model");
const notify_1 = require("../emails/notify");
async function WeeklyNotificationSend() {
    const reportfromDate = (0, dayjs_1.default)().startOf('day').valueOf();
    const reporttoDate = (0, dayjs_1.default)().endOf('day').valueOf();
    const requestData = await ins_request_model_1.InstrumentRequests.find({
        updated_at: {
            ...(reportfromDate && { $gte: reportfromDate }),
            ...(reporttoDate && { $lt: reporttoDate }), // Add 24 hours to include the end date
        },
    }) // filter data between start and end timestamps
        .sort({ updated_at: -1 }) // sort the data
        .toArray();
    const notificationDataAll = await (0, buildNotification_1.buildAllNotificationWeekly)(requestData);
    if (notificationDataAll && process.env.NOTIFY === 'Y') {
        const approvers = await users_model_1.Todos.find({ role: 'approver' }).toArray();
        await (0, notify_1.notifyAll)(approvers, notificationDataAll.subject, notificationDataAll.body);
    }
}
exports.WeeklyNotificationSend = WeeklyNotificationSend;
//# sourceMappingURL=weekly.js.map