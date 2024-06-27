"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyNotificationSend = void 0;
// import { Todo } from '../api/users/users.model';
const dayjs_1 = __importDefault(require("dayjs"));
const buildNotification_1 = require("../emails/buildNotification");
const notify_1 = require("../emails/notify");
const index_1 = require("../../../prisma/index");
const UsersConvertToInt = (user) => {
    const result = {
        ...user,
        _id: user.id,
        phone: Number(user?.phone),
        attempt: Number(user?.attempt),
        password_created: Number(user?.password_created),
        updated_at: Number(user?.updated_at),
        created_at: Number(user?.created_at),
    };
    return result;
};
async function WeeklyNotificationSend() {
    const reportfromDate = (0, dayjs_1.default)().subtract(7, 'days').startOf('day').valueOf();
    const reporttoDate = (0, dayjs_1.default)().subtract(1, 'days').endOf('day').valueOf();
    const where = {
        ...(reportfromDate && { updated_at: { gte: reportfromDate } }),
        ...(reporttoDate && { updated_at: { lt: reporttoDate } }),
    };
    const requestData = await index_1.prisma.instrumentRequest.findMany({
        where,
        orderBy: {
            updated_at: 'desc',
        },
        include: {
            std_used: true,
        },
    });
    const notificationDataAll = await (0, buildNotification_1.buildAllNotificationWeekly)(requestData);
    if (notificationDataAll && process.env.NOTIFY === 'Y') {
        const approvers = await index_1.prisma.user.findMany();
        const newPerformers = approvers.map((user) => {
            const newuser = UsersConvertToInt(user);
            return newuser;
        });
        await (0, notify_1.notifyAll)(newPerformers, notificationDataAll.subject, notificationDataAll.body);
    }
}
exports.WeeklyNotificationSend = WeeklyNotificationSend;
//# sourceMappingURL=weekly.js.map