"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCalibrationSchedule = exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAllCount = exports.getMachineCounts = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const cfr_model_1 = require("../cfr/cfr.model");
const cal_schedule_model_1 = require("./cal-schedule.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const inc_cal_model_1 = require("../instrument_calibration/inc-cal.model");
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
        const calibrationSchedules = await cal_schedule_model_1.CalibrationSchedules.find({
            due_date: {
                ...(startTimestamp && { $gte: startTimestamp }),
                ...(endTimestamp && { $lt: endTimestamp }), // Add 24 hours to include the end date
            },
        }) // filter data between start and end timestamps
            .sort({ updated_at: -1 }) // sort the data
            .toArray();
        res.json(calibrationSchedules);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
// count
const getMachineCounts = async (req, res) => {
    try {
        const instruments = await cal_schedule_model_1.CalibrationSchedules.find().sort({ updated_at: -1 }).toArray();
        const countsByStatus = {
            Draft: 0,
            Active: 0,
            InCalibration: 0,
            Removed: 0,
        };
        instruments.forEach((instrument) => {
            const status = instrument.status || '';
            // Ensure it's a string or empty
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
        const result = await cal_schedule_model_1.CalibrationSchedules.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 }, // Count each document
                },
            },
        ]).toArray();
        res.json(result[0]?.totalCount);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await cal_schedule_model_1.CalibrationSchedules.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting CalibrationSchedule.');
        res.status(201);
        res.json({
            _id: insertResult.insertedId,
            ...req.body,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function createMany(req, res, next) {
    try {
        const newUploadData = req.body.updatedSchedulePreview.map(async (data) => {
            if (data.instrument_id) {
                const instData = await inc_cal_model_1.InstrumentCalibrations.findOne({ instrument_id: data.instrument_id });
                data.department_id = instData?.department_id;
            }
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (mapResult) => {
            const insertResult = await cal_schedule_model_1.CalibrationSchedules.insertMany(mapResult);
            if (!insertResult.acknowledged)
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
                const result = await cfr_model_1.Cfrs.insertOne(data);
            }
            catch (error) {
                next(error);
            }
            res.status(201);
            res.json({
                ...req.body,
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function findOne(req, res, next) {
    try {
        const result = await cal_schedule_model_1.CalibrationSchedules.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        const result = await cal_schedule_model_1.CalibrationSchedules.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`CalibrationSchedule with id "${req.params.id}" not found.`);
        }
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await cal_schedule_model_1.CalibrationSchedules.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
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
        const result = await cal_schedule_model_1.CalibrationSchedules.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('CalibrationSchedule  not found.');
        }
        res.json(`${result?.deletedCount} records of CalibrationSchedule have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function updateCalibrationSchedule(body) {
    try {
        const resultIns = await cal_schedule_model_1.CalibrationSchedules.find({ instrument_id: body.instrument_id, schedule_status: 'Active' }).toArray();
        const dateDiff = (0, dayjs_1.default)(body.due_date).diff((0, dayjs_1.default)(body.prev_due_date), 'day');
        const updatedSchedules = resultIns.map((current_schedule_item) => {
            const prev_schedule_item = { ...current_schedule_item };
            current_schedule_item.instrument_desc = body.instrument_desc;
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
//# sourceMappingURL=cal-schedule.handlers.js.map