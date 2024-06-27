"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = void 0;
const prisma_1 = require("../../../../prisma");
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
async function findAll(req, res, next) {
    try {
        const result = await prisma_1.prisma.apiStatus.count();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const insertResult = await prisma_1.prisma.apiStatus.create({ data: req.body });
        if (!insertResult)
            throw new Error('Error inserting ApiStatus.');
        const dataToSend = convertToInt(insertResult);
        res.status(201);
        res.json({
            dataToSend,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.apiStatus.findUnique({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`ApiStatus with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.apiStatus.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`ApiStatus with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.apiStatus.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
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
        const result = await prisma_1.prisma.apiStatus.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('ApiStatuses  not found.');
        }
        res.json(`${result?.count} records of ApiStatuses have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=api-status.handlers.js.map