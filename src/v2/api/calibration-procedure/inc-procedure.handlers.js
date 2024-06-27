"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const prisma_1 = require("../../../../prisma");
const utils_1 = require("./utils");
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentProcedure.count();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function findAll(req, res, next) {
    try {
        const instrumentProcedure = await prisma_1.prisma.instrumentProcedure.findMany({
            orderBy: {
                updated_at: 'desc',
            },
        });
        const dataToSend = instrumentProcedure.map(ip => (0, utils_1.convertFromPrismaData)(ip));
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at', 'created_at']);
        const data = (0, utils_1.convertToPrismaData)(newData);
        const insertResult = await prisma_1.prisma.instrumentProcedure.create({ data });
        if (!insertResult)
            throw new Error('Error inserting InstrumentProcedure.');
        const dataToSend = (0, utils_1.convertFromPrismaData)(insertResult);
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
        const result = await prisma_1.prisma.instrumentProcedure.findUnique({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentProcedure with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentProcedure.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentProcedure with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentProcedure.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
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
        const results = await prisma_1.prisma.instrumentProcedure.deleteMany({});
        if (!results) {
            res.status(404);
            throw new Error('InstrumentProcedure not found.');
        }
        res.json(`${results?.count} records of InstrumentProcedure have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-procedure.handlers.js.map