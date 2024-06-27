"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCalibrationSchedule = exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAllCount = exports.getMachineCounts = exports.findAll = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("../../../../prisma");
const utils_1 = require("./utils");
const cfr_helper_1 = require("../cfr/cfr.helper");
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
            const batch = await prisma_1.prisma.stdCalibrationSchedule.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                include: {
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
        const stdCalibrationSchedules = respData;
        const dataToSend = stdCalibrationSchedules.map(cs => (0, utils_1.convertFromPrismaData)(cs));
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
        const instruments = await prisma_1.prisma.stdCalibrationSchedule.findMany({
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
            //  // Ensure it's a string or empty
            if (status in countsByStatus) {
                countsByStatus[status]++;
            }
        });
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
        const totalCount = await prisma_1.prisma.stdCalibrationSchedule.count();
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
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at', 'created_at']);
        const { _id, ...newDataWithoutId } = newData;
        const data = (0, utils_1.convertToPrismaData)(newDataWithoutId);
        const insertResult = await prisma_1.prisma.stdCalibrationSchedule.create({
            data: data,
            include: {
                performed_by: true,
            },
        });
        if (!insertResult)
            throw new Error('Error inserting Std CalibrationSchedule.');
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
                const instData = await prisma_1.prisma.stdCalibrationSchedule.findFirst({
                    where: {
                        instrument_id_no: data.instrument_id_no,
                    },
                });
                data.department_id = instData?.department_id;
            }
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        }));
        const insertResult = newUploadData.map((uploadData) => {
            // const { std_used, performed_by, ...data } = uploadData;
            const data = (0, utils_1.convertToPrismaData)(uploadData);
            return prisma_1.prisma.stdCalibrationSchedule.create({
                data: data,
                include: {
                    performed_by: true,
                },
            });
        });
        if (!insertResult)
            throw new Error('Error inserting stdCalibrationSchedule.');
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
            // 
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
        const result = await prisma_1.prisma.stdCalibrationSchedule.findFirst({
            where: {
                id: (req.params.id),
            },
            include: {
                performed_by: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Std InstrumentCalibration with id "${req.params.id}" not found.`);
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
        const { performed_by, ...data } = req.body;
        if (performed_by) {
            await prisma_1.prisma.performed_By_User.deleteMany({
                where: {
                    std_calibration_schedule_id: (req.params.id),
                },
            });
        }
        const { _id, ...dataWithoutId } = req.body;
        const uploadData = (0, utils_1.convertToPrismaData)(dataWithoutId);
        const result = await prisma_1.prisma.stdCalibrationSchedule.update({
            where: {
                id: (req.params.id),
            },
            data: uploadData,
            include: {
                performed_by: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Std CalibrationSchedule with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.stdCalibrationSchedule.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Std CalibrationSchedule with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.stdCalibrationSchedule.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('Std CalibrationSchedule not found.');
        }
        res.json(`${result} records of Std CalibrationSchedule have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function updateCalibrationSchedule(body) {
    try {
        const respIns = await prisma_1.prisma.stdCalibrationSchedule.findMany({
            where: {
                instrument_id_no: body.instrument_id_no,
                schedule_status: 'Active',
            },
            include: {
                performed_by: true,
            },
        });
        const resultIns = respIns.map((item) => (0, utils_1.convertFromPrismaData)(item));
        const dateDiff = (0, dayjs_1.default)(body.due_date).diff((0, dayjs_1.default)(body.prev_due_date), 'day');
        const updatedSchedules = resultIns.map((current_schedule_item) => {
            const prev_schedule_item = { ...current_schedule_item };
            current_schedule_item.due_date = (0, dayjs_1.default)(current_schedule_item.due_date).add(dateDiff, 'day').valueOf();
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
//# sourceMappingURL=std-cal-schedule.handlers.js.map