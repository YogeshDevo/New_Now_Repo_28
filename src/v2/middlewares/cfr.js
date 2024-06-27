"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfrIntercept = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const buildNotification_1 = require("../emails/buildNotification");
const notify_1 = require("../emails/notify");
const prisma_1 = require("../../../prisma");
const users_handlers_1 = require("../api/users/users.handlers");
var jwt = require("jsonwebtoken");
const changeIdTo_id = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
const API_DEF = {
    "inc-cal": "Instrument Calibration",
    "ins-master": "Instrument Master",
    "cal-schedule": "Calibration Schedule",
    report: "Calibration Report",
    "ins-request": "Instrument Request",
};
// const MODULE_REF: any = {
//   'inc-cal': InstrumentCalibrations,
//   'ins-master': InsMasters,
//   'cal-schedule': CalibrationSchedules,
//   'report': CalReports,
//   'ins-request': InstrumentRequests,
// };
const MODULE_REF = {
    "inc-cal": prisma_1.prisma.instrumentCalibration,
    "ins-master": prisma_1.prisma.instrumentMaster,
    "cal-schedule": prisma_1.prisma.calibrationSchedule,
    report: prisma_1.prisma.calReport,
    "ins-request": prisma_1.prisma.instrumentRequest,
};
function findModuleName(url) {
    const moduleIdentifier = process.env.NODE_ENV === "production"
        ? url.split("/")[1]
        : url.split("/")[3];
    return API_DEF[moduleIdentifier];
}
function findModule(url) {
    const moduleIdentifier = process.env.NODE_ENV === "production"
        ? url.split("/")[1]
        : url.split("/")[3];
    return MODULE_REF[moduleIdentifier];
}
function findObjectId(url) {
    const moduleIdentifierSplit = url.split("/");
    return moduleIdentifierSplit[moduleIdentifierSplit.length - 1];
}
const generateChangeString = (obj1, obj2) => {
    const changes = [];
    for (const key in obj1) {
        if (typeof obj1[key] === "bigint") {
            obj1[key] = Number(obj1[key]);
        }
        if (key !== "_id" && obj2.hasOwnProperty(key)) {
            if (obj1[key] !== obj2[key]) {
                changes.push(` \n ${key} changed from "${obj1[key] === null || obj1[key] === undefined
                    ? "-"
                    : key.includes("date") || key.includes("time")
                        ? (0, dayjs_1.default)(obj1[key])
                        : obj1[key]}" to "${obj2[key] === null || obj2[key] === undefined
                    ? "-"
                    : key.includes("date") || key.includes("time")
                        ? (0, dayjs_1.default)(obj2[key])
                        : obj2[key]}"`);
            }
        }
    }
    return changes.join(", \n");
};
async function cfrIntercept(req, res, next) {
    const url = req.url;
    const method = req.method;
    const authorization = req.headers.authorization;
    const body = req.body;
    const moduleName = findModuleName(url) || null;
    const moduleItem = findModule(url) || null;
    if (method === "PUT" &&
        moduleName !== null &&
        moduleItem !== null &&
        !url.includes("/many") &&
        authorization) {
        const objectIdString = findObjectId(url);
        // const beforeObj = await moduleItem?.findOne({
        //   _id: new ObjectId(objectIdString),
        // });
        if (url.includes("/set-points") ||
            url.includes("/set-point-table") ||
            url.includes("-many")) {
            next();
            return;
        }
        if (objectIdString === "undefined" ||
            objectIdString === undefined ||
            typeof objectIdString === "undefined") {
            // next();
            return;
        }
        const beforeObjRes = await moduleItem.findUnique({
            where: {
                id: objectIdString,
            },
        });
        if (!beforeObjRes || (beforeObjRes && !beforeObjRes.id)) {
            // next();
            return;
        }
        const beforeObj = changeIdTo_id(beforeObjRes);
        const changeString = generateChangeString(beforeObj, body);
        res.on("finish", async () => {
            if (authorization) {
                const decodedUser = jwt.verify(authorization, process.env.JWT_SECRET);
                const user = await prisma_1.prisma.user.findUnique({
                    where: {
                        email: decodedUser.email,
                    },
                });
                const currentTimeStamp = (0, dayjs_1.default)().valueOf();
                const commonData = {
                    timestamp: (0, dayjs_1.default)().valueOf(),
                    timestamp_year: (0, dayjs_1.default)(currentTimeStamp).year().toString(),
                    timestamp_year_month: `${(0, dayjs_1.default)(currentTimeStamp).year().toString} ${(0, dayjs_1.default)(currentTimeStamp).year().toString}`,
                    user_name: user?.username,
                    email: user?.email ?? body?.email,
                    module: moduleName,
                    method: method,
                    activity: "UPDATE",
                    description: `${user?.email} / ${user?.role} has updated the following information in collection ${moduleName} related to  ${beforeObj?.instrument_id ?? beforeObj?.instrument_id_no}  -  ${changeString}`,
                    role: user?.role,
                    updated_at: (0, dayjs_1.default)().valueOf(),
                };
                try {
                    // await Cfrs.insertOne(commonData);
                    await prisma_1.prisma.cfr.create({
                        data: commonData,
                    });
                    const notificationData = await (0, buildNotification_1.buildOneNotification)(commonData);
                    if (notificationData && process.env.NOTIFY === "Y") {
                        await (0, notify_1.notifyOne)(commonData, notificationData.subject, notificationData.body);
                    }
                    const notificationDataAll = await (0, buildNotification_1.buildAllNotification)(commonData);
                    if (notificationDataAll && process.env.NOTIFY === "Y") {
                        // const approvers = await Todos.find({role: 'approver'}).toArray();
                        const approversRes = await prisma_1.prisma.user.findMany({
                            where: { role: "approver" },
                        });
                        const approvers = approversRes.map((approver) => {
                            return (0, users_handlers_1.UsersConvertToInt)(approver);
                        });
                        await (0, notify_1.notifyAll)(approvers, notificationDataAll.subject, notificationDataAll.body);
                    }
                }
                catch (err) {
                    // next(err);
                }
            }
        });
        // next();
    }
    else {
        // next();
    }
    next();
}
exports.cfrIntercept = cfrIntercept;
//# sourceMappingURL=cfr.js.map