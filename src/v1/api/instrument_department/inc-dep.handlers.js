"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.createMany = exports.createOne = exports.findAllCount = exports.findOne = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const cfr_model_1 = require("../cfr/cfr.model");
const inc_dep_model_1 = require("./inc-dep.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
async function findAll(req, res, next) {
    try {
        const instrumentDepartments = await inc_dep_model_1.InstrumentDepartments.find().sort({ created_at: -1 }).toArray();
        res.json(instrumentDepartments);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function findOne(req, res, next) {
    try {
        const result = await inc_dep_model_1.InstrumentDepartments.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function findAllCount(req, res, next) {
    try {
        const result = await inc_dep_model_1.InstrumentDepartments.aggregate([
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
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const isAlreadyExist = await inc_dep_model_1.InstrumentDepartments.findOne({ name: newData.name });
        if (isAlreadyExist) {
            return res.status(409).json({
                message: `Block with name "${newData.name}" already exist.`,
            });
        }
        const insertResult = await inc_dep_model_1.InstrumentDepartments.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting InstrumentDepartment.');
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
        const newUploadData = req.body.uploadData.map(async (data) => {
            data.created_at = new Date().getTime();
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (mapResult) => {
            const insertResult = await inc_dep_model_1.InstrumentDepartments.insertMany(mapResult);
            if (!insertResult.acknowledged)
                throw new Error('Error inserting InstrumentDepartment.');
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
async function updateOne(req, res, next) {
    try {
        const isAlreadyExist = await inc_dep_model_1.InstrumentDepartments.findOne({ name: req.body.name });
        if (isAlreadyExist && isAlreadyExist._id.toString() !== req.params.id) {
            return res.status(409).json({
                message: `Block with name "${req.body.name}" already exist.`,
            });
        }
        const result = await inc_dep_model_1.InstrumentDepartments.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
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
        const result = await inc_dep_model_1.InstrumentDepartments.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
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
        const result = await inc_dep_model_1.InstrumentDepartments.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentDepartment  not found.');
        }
        res.json(`${result?.deletedCount} records of Instrument Department have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-dep.handlers.js.map