"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOne = exports.deleteOne = exports.createOne = exports.findAllWithId = exports.findAll = void 0;
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
async function findAll(req, res, next) {
    try {
        const tolerances = await prisma_1.prisma.tolerance.findMany();
        const toleranceMap = tolerances.reduce((acc, { tolerance, label }) => {
            acc[label] = {
                tolerance,
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
        const tolerances = await prisma_1.prisma.tolerance.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        const dataToSend = tolerances.map((tolerance) => {
            const result = convertToInt(tolerance);
            delete result.id;
            return result;
        });
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllWithId = findAllWithId;
async function createOne(req, res, next) {
    try {
        const insertResult = await prisma_1.prisma.tolerance.create({ data: req.body });
        const dataToSend = convertToInt(insertResult);
        res.status(201).json({
            dataToSend,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.tolerance.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
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
        const result = await prisma_1.prisma.tolerance.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result.label) {
            res.status(404);
            throw new Error(`Tolerance with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
//# sourceMappingURL=tolerances.handlers.js.map