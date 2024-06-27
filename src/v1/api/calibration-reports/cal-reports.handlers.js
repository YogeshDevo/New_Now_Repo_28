"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetOne = exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const mongodb_1 = require("mongodb");
const cal_reports_model_1 = require("./cal-reports.model");
const lock_instruments_handlers_1 = require("../lock-instruments/lock-instruments.handlers");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const cal_schedule_model_1 = require("../calibration-schedule/cal-schedule.model");
const db_1 = require("../../db");
const users_model_1 = require("../users/users.model");
const cfr_model_1 = require("../cfr/cfr.model");
const inc_cal_model_1 = require("../instrument_calibration/inc-cal.model");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = Todos.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<Todo>) => {
//       // Emit the change to connected clients
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await cal_reports_model_1.Todos.aggregate([
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
        const todos = await cal_reports_model_1.Todos.find({
            calibration_done_on_report: {
                ...(startTimestamp && { $gte: startTimestamp }),
                ...(endTimestamp && { $lt: endTimestamp }),
            },
        }) // filter data between start and end timestamps
            .sort({ updated_at: -1 }) // sort the data
            .toArray();
        res.json(todos);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        if (await (0, lock_instruments_handlers_1.lock)(req.body, req.headers._id)) {
            const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
            const insertResult = await cal_reports_model_1.Todos.insertOne(newData);
            if (!insertResult.acknowledged)
                throw new Error('Error inserting todo.');
            res.status(201);
            res.json({
                _id: insertResult.insertedId,
                ...req.body,
            });
        }
        else {
            res.send({ msg: 'Error in locking the instruments' });
        }
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await cal_reports_model_1.Todos.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
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
        const result = await cal_reports_model_1.Todos.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        (0, lock_instruments_handlers_1.deleteLockInstruments)(result.value, req.headers._id);
        if (!result.value) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function updateMany(req, res, next) {
    const session = db_1.client.startSession();
    const datalist = req.body;
    const cfrData = {
        timestamp: new Date().getTime(),
        module: 'Calibration Report',
        method: req.method,
        activity: 'UPDATE',
        updated_at: new Date().getTime(),
    };
    try {
        await session.withTransaction(async () => {
            datalist.forEach(async ({ _id, ...data }) => {
                const result = await cal_reports_model_1.Todos.findOneAndUpdate({
                    _id: new mongodb_1.ObjectId(_id),
                }, {
                    $set: { ...data },
                }, {
                    returnDocument: 'after',
                });
                (0, lock_instruments_handlers_1.deleteLockInstruments)(result.value, req.headers._id);
                if (!result.value) {
                    res.status(404);
                    throw new Error(`Report with id "${req.params.id}" not found.`);
                }
            });
        });
        await session.commitTransaction();
        const user = await users_model_1.Todos.findOne({ email: req.headers.authorization });
        if (user) {
            cfrData.email = user.email;
            cfrData.user_name = user.username;
            cfrData.role = user.role;
            cfrData.description = `${datalist.length} records of Calibration report's status updated to ${datalist[0].status} by ${user.username}.`;
            await cfr_model_1.Cfrs.insertOne(cfrData);
        }
        res.json(`${datalist.length} records of Calibration report's status updated to ${datalist[0].status}`);
    }
    catch (error) {
        next(error);
    }
    finally {
        session.endSession();
    }
}
exports.updateMany = updateMany;
async function deleteOne(req, res, next) {
    try {
        const result = await cal_reports_model_1.Todos.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
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
        const results = await cal_reports_model_1.Todos.deleteMany({});
        if (!results) {
            res.status(404);
            throw new Error('Calibration reportnot found.');
        }
        res.json(`${results?.deletedCount} records of Calibration report have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function resetOne(req, res, next) {
    try {
        const calibrationReportFound = await cal_reports_model_1.Todos.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        await cal_schedule_model_1.CalibrationSchedules.findOneAndUpdate({
            instrument_id: calibrationReportFound?.instrument_id,
        }, {
            $set: {
                status: 'Active',
                schedule_status: 'Active',
            },
        }, {
            returnDocument: 'after',
        });
        await inc_cal_model_1.InstrumentCalibrations.findOneAndUpdate({
            instrument_id: calibrationReportFound?.instrument_id,
        }, {
            $set: {
                status: 'Active',
            },
        }, {
            returnDocument: 'after',
        });
        const result = await cal_reports_model_1.Todos.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}
exports.resetOne = resetOne;
//# sourceMappingURL=cal-reports.handlers.js.map