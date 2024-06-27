"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfrIntercept = void 0;
const inc_cal_model_1 = require("../api/instrument_calibration/inc-cal.model");
const mongodb_1 = require("mongodb");
const dayjs_1 = __importDefault(require("dayjs"));
const cfr_model_1 = require("../api/cfr/cfr.model");
const users_model_1 = require("../api/users/users.model");
const ins_master_model_1 = require("../api/instrument_master/ins-master.model");
const cal_reports_model_1 = require("../api/calibration-reports/cal-reports.model");
const cal_schedule_model_1 = require("../api/calibration-schedule/cal-schedule.model");
const ins_request_model_1 = require("../api/instrument_request/ins-request.model");
const buildNotification_1 = require("../emails/buildNotification");
const notify_1 = require("../emails/notify");
const API_DEF = {
    'inc-cal': 'Instrument Calibration',
    'ins-master': 'Instrument Master',
    'cal-schedule': 'Calibration Schedule',
    'report': 'Calibration Report',
    'ins-request': 'Instrument Request',
};
const MODULE_REF = {
    'inc-cal': inc_cal_model_1.InstrumentCalibrations,
    'ins-master': ins_master_model_1.Todos,
    'cal-schedule': cal_schedule_model_1.CalibrationSchedules,
    'report': cal_reports_model_1.Todos,
    'ins-request': ins_request_model_1.InstrumentRequests,
};
function findModuleName(url) {
    const moduleIdentifier = url.split('/')[3];
    return API_DEF[moduleIdentifier];
}
function findModule(url) {
    const moduleIdentifier = url.split('/')[3];
    return MODULE_REF[moduleIdentifier];
}
function findObjectId(url) {
    const moduleIdentifierSplit = url.split('/');
    return moduleIdentifierSplit[moduleIdentifierSplit.length - 1];
}
const generateChangeString = (obj1, obj2) => {
    const changes = [];
    for (const key in obj1) {
        if (key !== '_id' && obj1.hasOwnProperty(key)) {
            if (obj1[key] !== obj2[key]) {
                changes.push(` \n ${key} changed from "${key.includes('date') ? (0, dayjs_1.default)(obj1[key]).toISOString() : obj1[key]}" to "${key.includes('date') ? (0, dayjs_1.default)(obj2[key]).toISOString() : obj2[key]}"`);
            }
        }
    }
    return changes.join(', \n');
};
async function cfrIntercept(req, res, next) {
    const moduleName = findModuleName(req.url) || null;
    const moduleItem = findModule(req.url) || null;
    if (req.method === 'PUT' && moduleName !== null && moduleItem !== null && !req.url.includes('/many') && req.headers.authorization) {
        const objectIdString = findObjectId(req.url);
        if (objectIdString === undefined || typeof objectIdString === 'undefined') {
            next();
            return;
        }
        const beforeObj = await moduleItem?.findOne({
            _id: new mongodb_1.ObjectId(objectIdString),
        });
        const changeString = generateChangeString(beforeObj, req.body);
        const user = await users_model_1.Todos.findOne({ email: req.headers.authorization });
        const commonData = {
            timestamp: (0, dayjs_1.default)().valueOf(),
            user_name: user?.username,
            email: user?.email,
            module: moduleName,
            method: req.method,
            activity: 'UPDATE',
            description: `${user?.email} / ${user?.role} has updated the following information in collection ${moduleName} related to  ${beforeObj?.instrument_id || beforeObj?.instrument_id_no}  -  ${changeString}`,
            role: user?.role,
            updated_at: (0, dayjs_1.default)().valueOf(),
        };
        try {
            await cfr_model_1.Cfrs.insertOne(commonData);
            const notificationData = await (0, buildNotification_1.buildOneNotification)(commonData);
            if (notificationData && process.env.NOTIFY === 'Y') {
                await (0, notify_1.notifyOne)(commonData, notificationData.subject, notificationData.body);
            }
            const notificationDataAll = await (0, buildNotification_1.buildAllNotification)(commonData);
            if (notificationDataAll && process.env.NOTIFY === 'Y') {
                const approvers = await users_model_1.Todos.find({ role: 'approver' }).toArray();
                await (0, notify_1.notifyAll)(approvers, notificationDataAll.subject, notificationDataAll.body);
            }
        }
        catch (err) {
        }
        next();
    }
    else {
        next();
    }
}
exports.cfrIntercept = cfrIntercept;
//# sourceMappingURL=cfr.js.map