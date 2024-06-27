"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOne = exports.deleteOne = exports.findAll = exports.createOne = void 0;
const prisma_1 = require("../../../../prisma");
const convertToInt = (data) => {
    const result = {
        ...data,
        _id: data.id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
async function createOne(req, res, next) {
    try {
        const insertResult = await prisma_1.prisma.unit.create({ data: req.body });
        res.status(201);
        const dataToSend = convertToInt(insertResult);
        res.json({
            dataToSend,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findAll(req, res, next) {
    try {
        const units = await prisma_1.prisma.unit.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        const dataToSend = units.map((unit) => {
            const result = convertToInt(unit);
            delete result.id;
            return result;
        });
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.unit.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
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
        const result = await prisma_1.prisma.unit.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`Unit with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
//# sourceMappingURL=units.handlers.js.map