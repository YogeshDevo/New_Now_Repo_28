"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countAllReq = exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAll = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const prisma_1 = require("../../../../prisma");
const utils_1 = require("./utils");
const dayjs_1 = __importDefault(require("dayjs"));
const cfr_helper_1 = require("../cfr/cfr.helper");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   // 
//   if (!changeStream) {
//     // 
//     changeStream = InstrumentRequests.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<InstrumentRequest>) => {
//       // Emit the change to connected clients
//       // 
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
//findAll remaining
const jwt = require('jsonwebtoken');
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
        calibration_done_on: Number(data?.calibration_done_on),
        due_date: Number(data?.due_date),
    };
    return result;
};
async function findAll(req, res, next) {
    try {
        // 
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate, 10);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate, 10);
        }
        // setupChangeStream();
        const requestType = req.query.request_type;
        const where = {
            ...(requestType && { request_type: requestType }),
            ...(startTimestamp && { updated_at: { gte: startTimestamp } }),
            ...(endTimestamp && { updated_at: { lt: endTimestamp } }),
        };
        const batchSize = parseInt(process.env.BATCH_SIZE || '1000');
        let offset = 0;
        let respData = [];
        while (true) {
            const batch = await prisma_1.prisma.instrumentRequest.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                include: {
                    std_used: true,
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
        const result = respData;
        const dataToSend = result.map((ir) => (0, utils_1.convertFromPrismaData)(ir));
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            'updated_at',
        ]);
        const { std_used, ...rest } = newData;
        const data = (0, utils_1.convertToPrismaData)(newData);
        const insertResult = await prisma_1.prisma.instrumentRequest.create({
            data: data,
            include: {
                std_used: true,
            },
        });
        if (!insertResult)
            throw new Error('Error inserting InstrumentRequest.');
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
async function createMany(req, res, next) {
    try {
        const newUploadData = req.body.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
            return data;
        });
        Promise.all(newUploadData).then(async (mapResult) => {
            const insertResult = await Promise.all(mapResult.map(async (uploadData) => {
                // const { std_used = [], ...dataWithoutStdUsed } = uploadData;
                const data = (0, utils_1.convertToPrismaData)(uploadData);
                const resp = await prisma_1.prisma.instrumentRequest.create({
                    data: data,
                    include: {
                        std_used: true,
                    },
                });
                // 
                return (0, utils_1.convertFromPrismaData)(resp);
            }));
            // const insertResult = await prisma.instrumentCalibration.createMany({ data: mapResult });
            if (!insertResult)
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
            data.description = `${newUploadData.length ?? 0} Items added successfully to the Instrument Request under block- ${req.headers.department_name}`;
            // 
            try {
                const result = await (0, cfr_helper_1.cfrCreateHelper)({ data: data });
                // 
            }
            catch (error) {
                next(error);
            }
            res.json({
                insertResult,
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
        const result = await prisma_1.prisma.instrumentRequest.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                std_used: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentRequest with id "${req.params.id}" not found.`);
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
    const { std_used = [], ...rest } = req.body;
    if (std_used.length > 0) {
        await prisma_1.prisma.std_String.deleteMany({
            where: {
                instrument_request_id: req.body.id,
            },
        });
    }
    const data = (0, utils_1.convertToPrismaData)(req.body);
    try {
        const result = await prisma_1.prisma.instrumentRequest.update({
            where: {
                id: req.params.id,
            },
            data: data,
            include: {
                std_used: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        res.json(dataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function updateMany(req, res, next) {
    const datalist = req.body;
    const cfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        module: 'Instrument Request',
        method: req.method,
        activity: 'UPDATE',
        updated_at: (0, dayjs_1.default)().valueOf(),
    };
    try {
        await prisma_1.prisma.$transaction(async (tx) => {
            const promises = datalist.map(async ({ _id, ...data }) => {
                const prev = await tx.instrumentRequest.findUnique({
                    where: { id: _id },
                });
                if (!prev) {
                    res.status(404);
                    throw new Error(`InstrumentRequest with id "${_id}" not found.`);
                }
                const dataToSend = (0, utils_1.convertToPrismaData)(data);
                await tx.instrumentRequest.update({
                    where: { id: _id },
                    data: dataToSend,
                    include: {
                        std_used: true,
                    },
                });
            });
            await Promise.all(promises);
        });
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (user) {
            (cfrData.user_name = user?.username),
                (cfrData.email = user?.email ?? req.body?.email),
                (cfrData.role = user?.role);
            cfrData.description = `${datalist.length} records of Instrument Request's status updated to ${datalist[0].status} by ${user.username}.`;
            try {
                await (0, cfr_helper_1.cfrCreateHelper)({
                    data: cfrData,
                });
            }
            catch (err) {
            }
        }
        res.json(`${datalist.length} records of Instrument Request's status updated to ${datalist[0].status === 'rejected' ? 'dropped' : datalist[0].status} successfully`);
    }
    catch (error) {
        next(error);
    }
}
exports.updateMany = updateMany;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentRequest.delete({
            where: {
                id: req.params.id,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.instrumentRequest.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentMaster  not found.');
        }
        res.json(`${result?.count} records of Instrument(Eqp) Master have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function countAllReq(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentRequest.groupBy({
            by: ['request_type'],
            _count: true,
        });
        const countStatus = {
            Decommission: 0,
            'New Instrument': 0,
            Overdue: 0,
            Recalibration: 0,
        };
        result.forEach((count) => {
            countStatus[count.request_type] = count._count;
        });
        const countActiveRequests = await prisma_1.prisma.instrumentRequest.count({
            where: {
                request_type: 'New Instrument',
                status: {
                    not: 'Completed',
                },
            },
        });
        countStatus.Active = countActiveRequests;
        res.json(countStatus);
    }
    catch (error) {
        next(error);
    }
}
exports.countAllReq = countAllReq;
//# sourceMappingURL=ins-request.handlers.js.map