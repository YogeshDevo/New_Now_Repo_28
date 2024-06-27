"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOne = exports.deleteOne = exports.findAll = exports.createOne = void 0;
const mongodb_1 = require("mongodb");
const units_model_1 = require("./units.model");
async function createOne(req, res, next) {
    try {
        const insertResult = await units_model_1.Units.insertOne(req.body);
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
async function findAll(req, res, next) {
    try {
        const units = await units_model_1.Units.find().sort({ created_at: -1 }).toArray();
        res.json(units);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function deleteOne(req, res, next) {
    try {
        const result = await units_model_1.Units.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Units with id "${req.params.id}" not found.`);
        }
        res.json(`deleted unit with id "${req.params.id}"`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
async function updateOne(req, res, next) {
    try {
        req.body.updated_at = new Date().getTime();
        const result = await units_model_1.Units.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Unit with id "${req.params.id}" not found.`);
        }
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
//# sourceMappingURL=units.handlers.js.map