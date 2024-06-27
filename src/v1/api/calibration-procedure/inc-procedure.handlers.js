"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const mongodb_1 = require("mongodb");
const inc_procedure_model_1 = require("./inc-procedure.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await inc_procedure_model_1.InstrumentProcedures.aggregate([
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
        const instrumentProcdure = await inc_procedure_model_1.InstrumentProcedures.find().sort({ updated_at: -1 }).toArray();
        res.json(instrumentProcdure);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await inc_procedure_model_1.InstrumentProcedures.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting InstrumentProcedure.');
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
async function findOne(req, res, next) {
    try {
        const result = await inc_procedure_model_1.InstrumentProcedures.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`Instrumentprocedure with id "${req.params.id}" not found.`);
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
        const result = await inc_procedure_model_1.InstrumentProcedures.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentProcedure with id "${req.params.id}" not found.`);
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
        const result = await inc_procedure_model_1.InstrumentProcedures.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`InstrumentProcedure with id "${req.params.id}" not found.`);
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
        const results = await inc_procedure_model_1.InstrumentProcedures.deleteMany({});
        if (!results) {
            res.status(404);
            throw new Error('InstrumentProcedure not found.');
        }
        res.json(`${results?.deletedCount} records of InstrumentProcedure have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-procedure.handlers.js.map