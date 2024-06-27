"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAllCount = exports.getMachineCounts = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const cfr_model_1 = require("../cfr/cfr.model");
const inc_cal_model_1 = require("./inc-cal.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const cal_schedule_handlers_1 = require("../calibration-schedule/cal-schedule.handlers");
const db_1 = require("../../db");
const users_model_1 = require("../users/users.model");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = InstrumentCalibrations.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<InstrumentCalibration>) => {
//       // Emit the change to connected clients
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
async function findAll(req, res, next) {
    try {
        // setupChangeStream();
        // 
        const instrumentCalibrations = await inc_cal_model_1.InstrumentCalibrations.find()
            .sort({ updated_at: -1 })
            .toArray();
        res.json(instrumentCalibrations);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
// count
const getMachineCounts = async (req, res) => {
    try {
        const result = await inc_cal_model_1.InstrumentCalibrations.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]).toArray();
        const countStatus = {
            Draft: 0,
            Active: 0,
            InCalibration: 0,
            Removed: 0,
            ReadyforApproval: 0,
            Discarded: 0,
        };
        result.forEach((count) => {
            countStatus[count._id] = count.count;
        });
        res.json(countStatus);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getMachineCounts = getMachineCounts;
async function findAllCount(req, res, next) {
    try {
        const result = await inc_cal_model_1.InstrumentCalibrations.aggregate([
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
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            'updated_at',
        ]);
        const insertResult = await inc_cal_model_1.InstrumentCalibrations.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting InstrumentCalibration.');
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
        // 
        // 
        const newUploadData = req.body.uploadData.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (mapResult) => {
            const insertResult = await inc_cal_model_1.InstrumentCalibrations.insertMany(mapResult);
            if (!insertResult.acknowledged)
                throw new Error('Error inserting InstrumentCalibration.');
            res.status(201);
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
        const result = await inc_cal_model_1.InstrumentCalibrations.findOne({
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
        const prev = await inc_cal_model_1.InstrumentCalibrations.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        const result = await inc_cal_model_1.InstrumentCalibrations.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
        }
        result.value.updated_Schedules = await (0, cal_schedule_handlers_1.updateCalibrationSchedule)({
            instrument_id: req.body.instrument_id,
            instrument_desc: req.body.instrument_desc,
            due_date: req.body.due_date,
            prev_due_date: prev?.due_date,
        });
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
// only applicable for updateMany
const cfrDescription = {
    ReadyforApproval: 'Reviewed',
    Active: 'Approved',
    Draft: 'Returned',
    Discarded: 'Rejected',
};
async function updateMany(req, res, next) {
    const session = db_1.client.startSession();
    const datalist = req.body;
    const cfrData = {
        timestamp: new Date().getTime(),
        module: 'Instrument Calibration List',
        method: req.method,
        activity: 'UPDATE',
        updated_at: new Date().getTime(),
    };
    try {
        await session.withTransaction(async () => {
            datalist.forEach(async ({ _id, ...data }) => {
                const prev = await inc_cal_model_1.InstrumentCalibrations.findOne({
                    _id: new mongodb_1.ObjectId(_id),
                });
                const result = await inc_cal_model_1.InstrumentCalibrations.findOneAndUpdate({
                    _id: new mongodb_1.ObjectId(_id),
                }, {
                    $set: {
                        ...data,
                    },
                }, {
                    returnDocument: 'after',
                });
                if (!result.value) {
                    res.status(404);
                    throw new Error(`InstrumentCalibration with id "${_id}" not found.`);
                }
                result.value.updated_Schedules = await (0, cal_schedule_handlers_1.updateCalibrationSchedule)({
                    instrument_id: data.instrument_id,
                    instrument_desc: data.instrument_desc,
                    due_date: data.due_date,
                    prev_due_date: prev?.due_date,
                });
            });
        });
        await session.commitTransaction();
        const user = await users_model_1.Todos.findOne({ email: req.headers.authorization });
        if (user) {
            cfrData.email = user.email;
            cfrData.user_name = user.username;
            cfrData.role = user.role;
            cfrData.description = `${datalist.length} records of Calibration Instrument's ${datalist.length > 1 ? 'are' : 'is'} ${cfrDescription[datalist[0].status ?? 'Active']} by ${user.username}.`;
            await cfr_model_1.Cfrs.insertOne(cfrData);
        }
        const instStatus = datalist[0]?.status;
        let message;
        if (instStatus === 'ReadyforApproval') {
            message = 'verified';
        }
        if (instStatus === 'Active') {
            message = 'approved';
        }
        if (instStatus === 'Draft') {
            message = 'returned';
        }
        if (instStatus === 'Discarded') {
            message = 'rejected';
        }
        res.json(`${datalist.length} ${datalist.length > 1 ? 'Instruments' : 'Instrument'} ${message} successfully.`);
    }
    catch (error) {
        next(error);
    }
    finally {
        await session.endSession();
    }
}
exports.updateMany = updateMany;
async function deleteOne(req, res, next) {
    try {
        const result = await inc_cal_model_1.InstrumentCalibrations.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
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
        const result = await inc_cal_model_1.InstrumentCalibrations.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentCalibration  not found.');
        }
        res.json(`${result?.deletedCount} records of Instrument Calibration have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-cal.handlers.js.map