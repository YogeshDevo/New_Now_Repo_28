"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCalibrationSchedule = exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAllCount = exports.getMachineCounts = exports.findAll = exports.findAllJobs = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const index_1 = require("../../../../prisma/index");
const utils_1 = require("./utils");
const utils_2 = require("../../utils");
const cfr_helper_1 = require("../cfr/cfr.helper");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = CalibrationSchedules.watch();
//     changeStream.on('update', (changeEvent: ChangeStreamEvents<CalibrationSchedule>) => {
//       // Emit the change to connected clients
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
//FindAll and updateCalibrationSchedule are remaning
async function findAllJobs(req, res, next) {
    try {
        // setupChangeStream();
        // Get start and end timestamps from query parameters
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate, 10);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate, 10);
        }
        const instrumentRequestTableDataIds = await index_1.prisma.instrumentRequest.findMany({
            where: {
                instrument_id: {
                    not: null,
                },
            },
            select: { instrument_id: true },
        });
        const where = {
            due_date: {
                ...(startTimestamp && { gte: startTimestamp }),
                ...(endTimestamp && { lt: endTimestamp }),
            },
            // checking weather instrument is available in request table or not
            instrument_id: {
                notIn: instrumentRequestTableDataIds.map((id) => id.instrument_id),
            },
        };
        const batchSize = parseInt(process.env.BATCH_SIZE || '1000');
        let offset = 0;
        let respData = [];
        while (true) {
            const batch = await index_1.prisma.calibrationSchedule.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                include: {
                    std_used: true,
                    performed_by: true,
                },
                skip: offset,
                take: batchSize,
            });
            if (batch.length === 0) {
                break;
            }
            respData = respData.concat(batch);
            offset += batchSize;
        }
        const calibrationSchedules = respData;
        const dataToSend = calibrationSchedules.map((cs) => (0, utils_1.convertFromPrismaData)(cs));
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllJobs = findAllJobs;
async function findAll(req, res, next) {
    try {
        // setupChangeStream();
        // Get start and end timestamps from query parameters
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate, 10);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate, 10);
        }
        const where = {
            due_date: {
                ...(startTimestamp && { gte: startTimestamp }),
                ...(endTimestamp && { lt: endTimestamp }),
            },
        };
        const batchSize = parseInt(process.env.BATCH_SIZE || '1000');
        let offset = 0;
        let respData = [];
        while (true) {
            const batch = await index_1.prisma.calibrationSchedule.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                include: {
                    std_used: true,
                    performed_by: true,
                },
                skip: offset,
                take: batchSize,
            });
            if (batch.length === 0) {
                break;
            }
            respData = respData.concat(batch);
            offset += batchSize;
        }
        const calibrationSchedules = respData;
        const dataToSend = calibrationSchedules.map((cs) => (0, utils_1.convertFromPrismaData)(cs));
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
// count
const getMachineCounts = async (req, res) => {
    try {
        const instruments = await index_1.prisma.calibrationSchedule.findMany({
            orderBy: { updated_at: 'desc' },
        });
        const countsByStatus = {
            Draft: 0,
            Active: 0,
            InCalibration: 0,
            Removed: 0,
        };
        instruments.forEach((instrument) => {
            const status = instrument.status || '';
            if (status in countsByStatus) {
                countsByStatus[status]++;
            }
        });
        // 
        res.json(countsByStatus);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getMachineCounts = getMachineCounts;
async function findAllCount(req, res, next) {
    try {
        const totalCount = await index_1.prisma.calibrationSchedule.count();
        res.json(totalCount);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            'updated_at',
            'created_at',
        ]);
        const { _id, ...newDataWithoutId } = newData;
        const data = (0, utils_1.convertToPrismaData)(newDataWithoutId);
        const insertResult = await index_1.prisma.calibrationSchedule.create({
            data: data,
            include: {
                std_used: true,
                performed_by: true,
            },
        });
        if (!insertResult)
            throw new Error('Error inserting CalibrationSchedule.');
        const dataToSend = (0, utils_1.convertFromPrismaData)(insertResult);
        res.status(201);
        res.json({
            dataToSend,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function createMany(req, res, next) {
    try {
        const updatedSchedulePreview = req.body.updatedSchedulePreview;
        const newUploadData = await Promise.all(updatedSchedulePreview.map(async ({ _id, ...data }) => {
            if (data.instrument_id) {
                const instData = await index_1.prisma.calibrationSchedule.findFirst({
                    where: {
                        instrument_id: data.instrument_id,
                    },
                });
                data.department_id = instData?.department_id;
            }
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        }));
        // const insertResult = await prisma.calibrationSchedule.createMany({
        //   data: newUploadData
        // });
        const insertResult = newUploadData.map((uploadData) => {
            // const { std_used, performed_by, ...data } = uploadData;
            const data = (0, utils_1.convertToPrismaData)(uploadData);
            return index_1.prisma.calibrationSchedule.create({
                data: data,
                include: {
                    std_used: true,
                    performed_by: true,
                },
            });
        });
        if (!insertResult)
            throw new Error('Error inserting CalibrationSchedule.');
        const data = {
            timestamp: (0, dayjs_1.default)().valueOf(),
            user_name: req.headers.user_name,
            email: req.headers.email,
            module: req.headers.module,
            activity: req.headers.activity,
            description: req.headers.description,
            method: req.headers.method,
            role: req.headers.role,
            updated_at: (0, dayjs_1.default)().valueOf(),
        };
        try {
            const result = await (0, cfr_helper_1.cfrCreateHelper)({
                data: data,
            });
        }
        catch (error) {
            next(error);
        }
        const dataToSend = insertResult.map((ir) => {
            return (0, utils_1.convertFromPrismaData)(ir);
        });
        res.status(201);
        res.json({
            dataToSend,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function findOne(req, res, next) {
    try {
        const result = await index_1.prisma.calibrationSchedule.findFirst({
            where: {
                id: req.params.id,
            },
            include: {
                std_used: true,
                performed_by: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        const { std_used, performed_by, ...data } = req.body;
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            let retryCount = 0;
            const executeFn = async () => {
                retryCount++;
                if (std_used) {
                    await tx.std_String.deleteMany({
                        where: {
                            calibration_schedule_id: req.params.id,
                        },
                    });
                }
                if (performed_by) {
                    await tx.performed_By_User.deleteMany({
                        where: {
                            calibration_schedule_id: req.params.id,
                        },
                    });
                }
                const { _id, ...dataWithoutId } = req.body;
                const uploadData = (0, utils_1.convertToPrismaData)(dataWithoutId);
                const result = await tx.calibrationSchedule.update({
                    where: {
                        id: req.params.id,
                    },
                    data: uploadData,
                    include: {
                        std_used: true,
                        performed_by: true,
                    },
                });
                return result;
            };
            const result = await (0, utils_2.retryAsyncFunction)(executeFn, 50);
            return result;
        }, {
            maxWait: 20000,
            timeout: 60000,
        });
        if (!transaction) {
            res.status(404);
            throw new Error(`CalibrationSchedule with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(transaction);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await index_1.prisma.calibrationSchedule.delete({
            where: {
                id: req.params.id,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`CalibrationSchedule with id "${req.params.id}" not found.`);
        }
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
async function deleteAll(req, res, next) {
    try {
        const result = await index_1.prisma.calibrationSchedule.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('CalibrationSchedule  not found.');
        }
        res.json(`${result} records of CalibrationSchedule have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function updateCalibrationSchedule(body) {
    try {
        // const resultIns = await CalibrationSchedules.find({ instrument_id: body.instrument_id, schedule_status: "Active" }).toArray()
        const respIns = await index_1.prisma.calibrationSchedule.findMany({
            where: {
                instrument_id: body.instrument_id,
                schedule_status: 'Active',
            },
            include: {
                std_used: true,
                performed_by: true,
            },
        });
        const resultIns = respIns.map((item) => (0, utils_1.convertFromPrismaData)(item));
        const dateDiff = (0, dayjs_1.default)(body.due_date).diff((0, dayjs_1.default)(body.prev_due_date), 'day');
        // 
        // 
        const updatedSchedules = resultIns.map((current_schedule_item) => {
            const prev_schedule_item = { ...current_schedule_item };
            current_schedule_item.instrument_desc = body.instrument_desc;
            current_schedule_item.due_date = (0, dayjs_1.default)(current_schedule_item.due_date)
                .add(dateDiff, 'day')
                .valueOf();
            return {
                current_schedule_item: current_schedule_item,
                prev_schedule_item: prev_schedule_item,
            };
        });
        return updatedSchedules;
    }
    catch (error) {
    }
}
exports.updateCalibrationSchedule = updateCalibrationSchedule;
//# sourceMappingURL=cal-schedule.handlers.js.map