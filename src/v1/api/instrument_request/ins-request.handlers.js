"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countAllReq = exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const ins_request_model_1 = require("./ins-request.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const db_1 = require("../../db");
const cfr_model_1 = require("../cfr/cfr.model");
const users_model_1 = require("../users/users.model");
const dayjs_1 = __importDefault(require("dayjs"));
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   // 
//   if (!changeStream) {
//     // 
//     changeStream = InstrumentRequests.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<InstrumentRequest>) => {
//       // Emit the change to connected clients
//       // 
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
async function findAll(req, res, next) {
    try {
        // 
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate, 10);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate, 10);
        }
        // setupChangeStream();
        const requestType = req.query.request_type;
        const instrumentRequests = await ins_request_model_1.InstrumentRequests.find({
            ...(requestType && { request_type: requestType }),
            ...(startTimestamp && { updated_at: { $gte: startTimestamp } }),
            ...(endTimestamp && { updated_at: { $lt: endTimestamp } }),
        }).sort({ updated_at: -1 }).toArray();
        res.json(instrumentRequests);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
// count
//
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await ins_request_model_1.InstrumentRequests.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting InstrumentRequest.');
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
        const newUploadData = req.body.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (newData) => {
            const insertResult = await ins_request_model_1.InstrumentRequests.insertMany(newData);
            if (!insertResult.acknowledged)
                throw new Error('Error inserting instrument request.');
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
        const result = await ins_request_model_1.InstrumentRequests.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentRequest with id "${req.params.id}" not found.`);
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
        const result = await ins_request_model_1.InstrumentRequests.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentRequest with id "${req.params.id}" not found.`);
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
        module: 'Instrument Request',
        method: req.method,
        activity: 'UPDATE',
        updated_at: new Date().getTime(),
    };
    try {
        await session.withTransaction(async () => {
            datalist.forEach(async ({ _id, ...data }) => {
                const result = await ins_request_model_1.InstrumentRequests.findOneAndUpdate({
                    _id: new mongodb_1.ObjectId(_id),
                }, {
                    $set: { ...data },
                }, {
                    returnDocument: 'after',
                });
                if (!result.value) {
                    res.status(404);
                    throw new Error(`InstrumentRequest with id "${_id}" not found.`);
                }
            });
        });
        await session.commitTransaction();
        const user = await users_model_1.Todos.findOne({ email: req.headers.authorization });
        if (user) {
            cfrData.email = user.email;
            cfrData.user_name = user.username;
            cfrData.role = user.role;
            cfrData.description = `${datalist.map((dataItem) => { return dataItem.request_id + ' ,'; })}  | ${datalist.length} records of Instrument Request's status updated to ${datalist[0].status} by ${user.username}.`;
            await cfr_model_1.Cfrs.insertOne(cfrData);
        }
        res.json(`${datalist.length} records of Instrument Request's status updated to ${datalist[0].status === 'Discarded' ? 'Rejected' : datalist[0].status} successfully.`);
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
        const result = await ins_request_model_1.InstrumentRequests.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentRequest with id "${req.params.id}" not found.`);
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
        const result = await ins_request_model_1.InstrumentRequests.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentRequest  not found.');
        }
        res.json(`${result?.deletedCount} records of InstrumentRequest have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function countAllReq(req, res, next) {
    try {
        const result = await ins_request_model_1.InstrumentRequests.aggregate([
            {
                $group: {
                    _id: '$request_type',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]).toArray();
        const countStatus = {
            Decommission: 0,
            'New Instrument': 0,
            Overdue: 0,
            Recalibration: 0,
        };
        result.forEach((count) => {
            countStatus[count._id] = count.count;
        });
        const activeRequestsQuery = {
            request_type: 'New Instrument',
            status: { $ne: 'Completed' },
        };
        const countActiveRequests = await ins_request_model_1.InstrumentRequests.countDocuments(activeRequestsQuery);
        countStatus.Active = countActiveRequests;
        res.json(countStatus);
    }
    catch (error) {
        next(error);
    }
}
exports.countAllReq = countAllReq;
//# sourceMappingURL=ins-request.handlers.js.map