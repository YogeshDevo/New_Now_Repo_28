"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAll = exports.getMachineCounts = exports.findAllCount = void 0;
const mongodb_1 = require("mongodb");
const cfr_model_1 = require("../cfr/cfr.model");
const ins_master_model_1 = require("./ins-master.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const db_1 = require("../../db");
const users_model_1 = require("../users/users.model");
// import { io } from '../..';
// let changeStream: ChangeStream;
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await ins_master_model_1.Todos.aggregate([
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
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = Todos.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<Todo>) => {
//       // Emit the change to connected clients
//       // 
//       io.emit('master', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
const getMachineCounts = async (req, res) => {
    try {
        const result = await ins_master_model_1.Todos.aggregate([
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
            'In Calibration': 0,
            Removed: 0,
            'Ready for Approval': 0,
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
async function findAll(req, res, next) {
    try {
        // setupChangeStream();
        const todos = await ins_master_model_1.Todos.find().sort({ updated_at: -1 }).toArray();
        res.json(todos);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            'updated_at',
        ]);
        const insertResult = await ins_master_model_1.Todos.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting todo.');
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
            const insertResult = await ins_master_model_1.Todos.insertMany(mapResult);
            if (!insertResult.acknowledged)
                throw new Error('Error inserting todo.');
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
        const result = await ins_master_model_1.Todos.findOne({
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
        const result = await ins_master_model_1.Todos.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
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
const cfrDescription = {
    'Ready for Approval': 'Reviewed',
    Active: 'Approved',
    Draft: 'Returned',
    Discarded: 'Rejected',
};
async function updateMany(req, res, next) {
    const session = db_1.client.startSession();
    const datalist = req.body;
    // 
    const cfrData = {
        timestamp: new Date().getTime(),
        module: 'Standard Instrument List',
        method: req.method,
        activity: 'UPDATE',
        updated_at: new Date().getTime(),
    };
    try {
        await session.withTransaction(async () => {
            datalist.forEach(async ({ _id, ...data }) => {
                const result = await ins_master_model_1.Todos.findOneAndUpdate({
                    _id: new mongodb_1.ObjectId(_id),
                }, {
                    $set: data,
                }, {
                    returnDocument: 'after',
                });
                if (!result.value) {
                    res.status(404);
                    throw new Error(`Master Instrument with id "${_id}" not found.`);
                }
            });
        });
        await session.commitTransaction();
        const user = await users_model_1.Todos.findOne({ email: req.headers.authorization });
        if (user) {
            cfrData.email = user.email;
            cfrData.user_name = user.username;
            cfrData.role = user.role;
            cfrData.description = `${datalist.length} records of Standard Instrument's ${datalist.length > 1 ? 'are' : 'is'} ${cfrDescription[datalist[0].status ?? 'Active']} by ${user.username}.`;
            await cfr_model_1.Cfrs.insertOne(cfrData);
        }
        const instStatus = datalist[0]?.status;
        let message;
        if (instStatus === 'Ready for Approval') {
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
        res.json(`${datalist.length} ${datalist.length > 1 ? 'Standard Instruments' : 'Standard Instrument'} ${message} successfully.`);
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
        const result = await ins_master_model_1.Todos.findOneAndDelete({
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
        const result = await ins_master_model_1.Todos.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentMaster  not found.');
        }
        res.json(`${result?.deletedCount} records of Instrument(Eqp) Master have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=ins_master.handlers.js.map