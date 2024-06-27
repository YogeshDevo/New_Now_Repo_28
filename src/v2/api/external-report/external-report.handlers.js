"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const prisma_1 = require("../../../../prisma");
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
        done_date: Number(data?.done_date),
    };
    return result;
};
async function findAllCount(req, res, next) {
    try {
        const externalReportsCount = await prisma_1.prisma.externalReport.count();
        res.json(externalReportsCount);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function findAll(req, res, next) {
    try {
        const externalReport = await prisma_1.prisma.externalReport.findMany({
            orderBy: {
                updated_at: 'desc',
            },
        });
        const dataToSend = externalReport.map((res) => {
            return convertToInt(res);
        });
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await prisma_1.prisma.externalReport.create({ data: newData });
        if (!insertResult)
            throw new Error('Error inserting ExternalReports.');
        const dataToSend = convertToInt(insertResult);
        res.status(201);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.externalReport.findUnique({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`ExternalReport with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.externalReport.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`ExternalReport with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.externalReport.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`ExternalReport with id "${req.params.id}" not found.`);
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
        const ExternalReportResult = await prisma_1.prisma.externalReport.deleteMany({});
        if (!ExternalReportResult) {
            res.status(404);
            throw new Error(' ExternalReport not found.');
        }
        res.json(`${ExternalReportResult?.count} records of External Report have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=external-report.handlers.js.map