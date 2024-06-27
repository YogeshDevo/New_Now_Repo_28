"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const api_status_model_1 = require("./api-status.model");
async function findAll(req, res, next) {
    try {
        const result = await api_status_model_1.ApiStatuses.aggregate([
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
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const insertResult = await api_status_model_1.ApiStatuses.insertOne(req.body);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting ApiStatus.');
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
        const result = await api_status_model_1.ApiStatuses.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`ApiStatus with id "${req.params.id}" not found.`);
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
        const result = await api_status_model_1.ApiStatuses.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`ApiStatus with id "${req.params.id}" not found.`);
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
        const result = await api_status_model_1.ApiStatuses.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`ApiStatus with id "${req.params.id}" not found.`);
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
        const result = await api_status_model_1.ApiStatuses.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('ApiStatuses  not found.');
        }
        res.json(`${result?.deletedCount} records of ApiStatuses have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=api-status.handlers.js.map