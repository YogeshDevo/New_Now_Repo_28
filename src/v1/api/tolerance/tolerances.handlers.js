"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOne = exports.deleteOne = exports.createOne = exports.findAllWithId = exports.findAll = void 0;
const tolerance_model_1 = require("./tolerance.model");
const mongodb_1 = require("mongodb");
async function findAll(req, res, next) {
    try {
        const tolerances = await tolerance_model_1.Tolerances.find().toArray();
        const toleranceMap = tolerances.reduce((acc, { tolerance, label, frequency }) => {
            acc[label] = {
                tolerance,
                frequency,
                label,
            };
            return acc;
        }, {});
        res.json(toleranceMap);
    }
    catch (error) {
        console.error('error', error);
        next(error);
    }
}
exports.findAll = findAll;
async function findAllWithId(req, res, next) {
    try {
        const tolerances = await tolerance_model_1.Tolerances.find().sort({ created_at: -1 }).toArray();
        res.json(tolerances);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllWithId = findAllWithId;
async function createOne(req, res, next) {
    try {
        const insertResult = await tolerance_model_1.Tolerances.insertOne(req.body);
        res.status(201).json({
            _id: insertResult.insertedId,
            ...req.body,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function deleteOne(req, res, next) {
    try {
        const result = await tolerance_model_1.Tolerances.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Tolerance with id "${req.params.id}" not found.`);
        }
        res.json(`deleted tolerance with id "${req.params.id}"`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
async function updateOne(req, res, next) {
    try {
        req.body.updated_at = new Date().getTime();
        const result = await tolerance_model_1.Tolerances.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Tolerance with id "${req.params.id}" not found.`);
        }
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
//# sourceMappingURL=tolerances.handlers.js.map