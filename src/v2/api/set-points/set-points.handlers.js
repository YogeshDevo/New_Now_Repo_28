"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAllCount = exports.findAll = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("../../../../prisma");
const cfr_helper_1 = require("../cfr/cfr.helper");
const convertToInt = (data) => {
    const result = {
        ...data,
        _id: data.id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    result.set_points = data?.set_points?.map((set_point) => {
        return set_point.value;
    });
    return result;
};
async function findAll(req, res, next) {
    try {
        const batchSize = parseInt(process.env.BATCH_SIZE || '1000');
        let offset = 0;
        let respData = [];
        while (true) {
            const batch = await prisma_1.prisma.setPoint.findMany({
                include: {
                    set_points: true,
                },
                skip: offset,
                take: batchSize,
            });
            if (batch.length === 0) {
                break;
            }
            respData = respData.concat(batch);
            offset += batchSize;
        }
        const setPoint = respData;
        const dataToSend = setPoint.map((data) => {
            return convertToInt(data);
        });
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await prisma_1.prisma.setPoint.count();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at', 'created_at']);
        const { set_points, ...dataWithoutSP } = newData;
        const insertResult = await prisma_1.prisma.$transaction(async (tx) => {
            const createRes = await tx.setPoint.create({
                data: {
                    ...dataWithoutSP,
                    set_points: {
                        createMany: {
                            data: [
                                ...(set_points?.map((val) => ({
                                    value: val,
                                })) || []),
                            ],
                        },
                    },
                },
                include: {
                    set_points: true,
                },
            });
            return createRes;
        });
        if (!insertResult)
            throw new Error('Error inserting SetPoints.');
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
async function createMany(req, res, next) {
    try {
        // 
        // 
        const newUploadData = req.body.uploadData.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        await Promise.all(newUploadData).then(async (mapResult) => {
            const resSetPoints = await prisma_1.prisma.$transaction(async (tx) => {
                const insertResult = await Promise.all(mapResult.map(async (data) => {
                    const { set_points = [], ...dataWithoutSP } = data;
                    const setPointsInner = set_points?.map((val) => ({
                        value: val,
                    }));
                    await Promise.all(setPointsInner);
                    const createSetPointWithRetry = async (retryCount = 0) => {
                        try {
                            const resSetPoints2 = await tx.setPoint.create({
                                data: {
                                    ...dataWithoutSP,
                                    set_points: {
                                        create: [
                                            ...setPointsInner,
                                        ],
                                    },
                                },
                                include: {
                                    set_points: true,
                                },
                            });
                            return convertToInt(resSetPoints2);
                        }
                        catch (error) {
                            if (retryCount < 5) {
                                const delay = Math.pow(2, retryCount) * 100;
                                await new Promise(resolve => setTimeout(resolve, delay));
                                return createSetPointWithRetry(retryCount + 1);
                            }
                            else {
                                return error;
                            }
                        }
                    };
                    return createSetPointWithRetry();
                }));
                return insertResult;
            }, {
                maxWait: 5000,
                timeout: 10000, // default: 5000
            });
            if (!resSetPoints)
                throw new Error('Error inserting InstrumentCalibration.');
            res.status(201);
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
                const result = await (0, cfr_helper_1.cfrCreateHelper)({ data: data });
                // 
            }
            catch (error) {
                next(error);
            }
            res.json({
                ...req.body,
                resSetPoints,
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.setPoint.findUnique({
            where: {
                id: (req.params.id),
            },
            include: {
                set_points: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`SetPoint with id "${req.params.id}" not found.`);
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
        const { set_points = [], ...dataWithoutSP } = req.body;
        const transaction = await prisma_1.prisma.$transaction(async (tx) => {
            if (set_points.length > 0) {
                await tx.set_point.deleteMany({
                    where: {
                        setPoint_id: req.params.id,
                    },
                });
            }
            const updatedRes = await tx.setPoint.update({
                where: {
                    id: (req.params.id),
                },
                data: {
                    ...dataWithoutSP,
                    set_points: {
                        createMany: {
                            data: [
                                ...(set_points?.map((val) => ({
                                    value: val,
                                })) || []),
                            ],
                        },
                    },
                },
                include: {
                    set_points: true,
                },
            });
            return updatedRes;
        });
        if (!transaction) {
            res.status(404);
            throw new Error(`SetPoint with id "${req.params.id}" not found.`);
        }
        const dataToSend = convertToInt(transaction);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function deleteOne(req, res, next) {
    try {
        await prisma_1.prisma.set_point.deleteMany({
            where: {
                setPoint_id: req.params.id,
            },
        });
        const result = await prisma_1.prisma.setPoint.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`SetPoint with id "${req.params.id}" not found.`);
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
        await prisma_1.prisma.set_point.deleteMany({});
        const result = await prisma_1.prisma.setPoint.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('SetPoints  not found.');
        }
        res.json(`${result?.count} records of Setpoints have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=set-points.handlers.js.map