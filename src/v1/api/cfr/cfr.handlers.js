"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = void 0;
const mongodb_1 = require("mongodb");
const cfr_model_1 = require("./cfr.model");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const buildNotification_1 = require("../../emails/buildNotification");
const notify_1 = require("../../emails/notify");
const users_model_1 = require("../users/users.model");
async function findAll(req, res, next) {
    try {
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate);
        }
        if (startTimestamp && endTimestamp) {
            const todos = await cfr_model_1.Cfrs.find({
                timestamp: {
                    ...(startTimestamp && { $gte: startTimestamp }),
                    ...(endTimestamp && { $lt: endTimestamp }),
                },
            })
                .sort({ updated_at: -1 })
                .toArray();
            res.json(todos);
        }
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await cfr_model_1.Cfrs.insertOne(newData);
        if (!insertResult.acknowledged)
            throw new Error('Error inserting Cfr.');
        const notificationData = await (0, buildNotification_1.buildOneNotification)(req.body);
        if (notificationData && process.env.NOTIFY === 'Y' && req.body.notify) {
            await (0, notify_1.notifyOne)(req.body, notificationData.subject, notificationData.body);
        }
        const notificationDataAll = await (0, buildNotification_1.buildAllNotification)(req.body);
        if (notificationDataAll && process.env.NOTIFY === 'Y' && req.body.notify) {
            const approvers = await users_model_1.Todos.find({ role: 'approver' }).toArray();
            await (0, notify_1.notifyAll)(approvers, notificationDataAll.subject, notificationDataAll.body);
        }
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
        const result = await cfr_model_1.Cfrs.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await cfr_model_1.Cfrs.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await cfr_model_1.Cfrs.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await cfr_model_1.Cfrs.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('Cfr  not found.');
        }
        res.json(`${result?.deletedCount} records of cfr have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=cfr.handlers.js.map