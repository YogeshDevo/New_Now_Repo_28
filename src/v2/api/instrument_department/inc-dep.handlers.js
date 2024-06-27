"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.createMany = exports.createOne = exports.findAllCount = exports.findOne = exports.findAll = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("../../../../prisma");
const cfr_helper_1 = require("../cfr/cfr.helper");
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
        const instrumentDepartments = await prisma_1.prisma.instrumentDepartment.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        const result = instrumentDepartments.map((user) => {
            const data = convertToInt(user);
            return data;
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentDepartment.findUnique({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function findAllCount(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentDepartment.count();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['created_at', 'updated_at']);
        const result = await prisma_1.prisma.instrumentDepartment.create({ data: newData });
        if (!result)
            throw new Error('Error inserting InstrumentDepartment.');
        res.status(201);
        const insertResult = convertToInt(result);
        res.json({
            insertResult,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function createMany(req, res, next) {
    try {
        const newUploadData = req.body.uploadData.map(async (data) => {
            data.created_at = new Date().getTime();
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at', 'created_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (mapResult) => {
            const insertResult = await prisma_1.prisma.instrumentDepartment.createMany({ data: mapResult });
            if (!insertResult)
                throw new Error('Error inserting InstrumentDepartment.');
            res.status(201);
            // ---------------------------------------------------------------
            const data = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: req.headers.user_name,
                email: req.headers.email,
                module: req.headers.module,
                activity: req.headers.activity,
                description: req.headers.description,
                method: req.headers.method,
                role: req.headers.role,
                updated_at: (0, dayjs_1.default)().valueOf(),
            };
            try {
                const result = await (0, cfr_helper_1.cfrCreateHelper)({ data });
            }
            catch (error) {
                next(error);
            }
            // ---------------------------------------------------------------
            res.json({
                ...req.body,
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function updateOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentDepartment.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
        }
        res.json(convertToInt(result));
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentDepartment.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentDepartment with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.instrumentDepartment.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentDepartment  not found.');
        }
        res.json(`${result?.count} records of Instrument Department have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-dep.handlers.js.map