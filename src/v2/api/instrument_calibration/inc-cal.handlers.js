"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.updateMany = exports.createMany = exports.createOne = exports.findAllCount = exports.getMachineCounts = exports.fisrt1000Data = exports.findAll = exports.findByPage = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const cal_schedule_handlers_1 = require("../calibration-schedule/cal-schedule.handlers");
const index_1 = require("../../../../prisma/index");
const utils_1 = require("./utils");
const utils_2 = require("../../utils");
const cfr_helper_1 = require("../cfr/cfr.helper");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = InstrumentCalibrations.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<InstrumentCalibration>) => {
//       // Emit the change to connected clients
//       // 
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
/////Update one needs to be checked
const jwt = require('jsonwebtoken');
async function findByPage(req, res, next) {
    try {
        // const t0 = performance.now();
        const status = req.query.status?.toString() ?? undefined;
        const department_id = req.query.department_id?.toString() ?? undefined;
        const page = parseInt(req.query.page?.toString() ?? '1');
        const limit = parseInt(req.query.limit?.toString() ?? '10');
        const search = req.query.search?.toString() ?? '';
        const where = {
            status,
            department_id,
            OR: search.length > 0
                ? [
                    { instrument_desc: { contains: search } },
                    { instrument_id: { contains: search } },
                    { instrument_location: { contains: search } },
                    { frequency: { contains: search } },
                    { certificate_no: { contains: search } },
                    // { calibration_done_on: { contains: search } },
                ]
                : undefined,
        };
        const dataPromise = index_1.prisma.instrumentCalibration.findMany({
            where,
            include: {
                std_used: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                updated_at: 'desc',
            },
        });
        const countPromise = index_1.prisma.instrumentCalibration.count({ where });
        const [data, count] = await Promise.all([dataPromise, countPromise]);
        const dataToSend = data.map((res) => (0, utils_1.convertFromPrismaData)(res));
        // const t1 = performance.now();
        res.json({ data: dataToSend, count });
    }
    catch (error) {
        next(error);
    }
}
exports.findByPage = findByPage;
async function findAll(req, res, next) {
    try {
        // const t0 = performance.now();
        const status = req.query.status?.toString() ?? undefined;
        const department_id = req.query.department_id?.toString() ?? undefined;
        // 
        const where = {
            status,
            department_id,
        };
        const batchSize = parseInt(process.env.BATCH_SIZE || '1800');
        const totalCount = await index_1.prisma.instrumentCalibration.count({ where });
        const fetchPromises = [];
        for (let i = 0; i < Math.ceil(totalCount / batchSize); i++) {
            fetchPromises.push(index_1.prisma.instrumentCalibration.findMany({
                where,
                include: {
                    std_used: true,
                },
                skip: i * batchSize,
                take: batchSize,
            }));
        }
        const results = await Promise.all(fetchPromises);
        const respData = results.flat();
        // let offset = 0;
        // let respData: TInsCalPrismaData[] = [];
        // let done = false;
        // while (!done) {
        //   const batches = [];
        //   const current_offset = offset;
        //   for (let i = 0; i < 5; i++) {
        //     batches.push(
        //       prisma.$transaction(async (tx) => {
        //         const batch = await tx.instrumentCalibration.findMany({
        //           where,
        //           include: {
        //             std_used: true,
        //           },
        //           skip: current_offset + batchSize * i,
        //           take: batchSize,
        //         });
        //         if (batch.length === 0) {
        //           done = true;
        //         } else {
        //           respData = respData.concat(batch);
        //           offset += batchSize;
        //         }
        //       }),
        //     );
        //     if (done) break;
        //   }
        //   await Promise.all(batches);
        // }
        const data = respData.map((r) => (0, utils_1.convertFromPrismaData)(r));
        // const t1 = performance.now();
        // 
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function fisrt1000Data(req, res, next) {
    try {
        const result = await index_1.prisma.instrumentCalibration.findMany({
            include: {
                std_used: true,
            },
            take: 1000,
        });
        const dataToSend = result.map((res) => (0, utils_1.convertFromPrismaData)(res));
        if (result.length >= 1000) {
            res.json({ result: dataToSend, lengthOver1000: true });
        }
        else {
            res.json({ result: dataToSend, lengthOver1000: false });
        }
    }
    catch (error) {
        next(error);
    }
}
exports.fisrt1000Data = fisrt1000Data;
// count
const getMachineCounts = async (req, res) => {
    try {
        const result = await index_1.prisma.instrumentCalibration.groupBy({
            by: ['status'],
            _count: true,
        });
        const countStatus = {
            Draft: 0,
            Active: 0,
            InCalibration: 0,
            Removed: 0,
            ReadyforApproval: 0,
            Discarded: 0,
        };
        // Map the result to the countStatus object
        result.forEach((count) => {
            countStatus[count.status] = count._count;
        });
        // Send response
        res.json(countStatus);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getMachineCounts = getMachineCounts;
async function findAllCount(req, res, next) {
    try {
        const totalCount = await index_1.prisma.instrumentCalibration.count();
        res.json(totalCount);
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
        const data = (0, utils_1.convertToPrismaData)(newData);
        const insertResult = await index_1.prisma.instrumentCalibration.create({
            data: data,
            include: {
                std_used: true,
            },
        });
        if (!insertResult)
            throw new Error('Error inserting InstrumentCalibration.');
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
        const t0 = performance.now();
        const newUploadData = await Promise.all(req.body.uploadData.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, ['updated_at', 'created_at']);
            return data;
        }));
        const newUploadDataCTPD = newUploadData.map((data) => {
            // we don't have std_used at the time of creation so convertToPrismaData will not return std_used;
            return (0, utils_1.convertToPrismaData)(data);
        });
        // const fakeData = { ...newUploadDataCTPD[0], alpha: "alpha" };
        // newUploadDataCTPD.pop();
        // newUploadDataCTPD.push(fakeData);
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
        const batches = [];
        const batchSize = parseInt(process.env.BATCH_SIZE || '1800');
        for (let i = 0; i < newUploadDataCTPD.length; i += batchSize) {
            batches.push(newUploadDataCTPD.slice(i, i + batchSize));
        }
        const prismaTransactionPromises = [];
        for (const batch of batches) {
            prismaTransactionPromises.push(index_1.prisma.$transaction(async (tx) => {
                const executeFn = async () => {
                    const respIns = await tx.instrumentCalibration.createMany({
                        data: batch,
                    });
                    return respIns;
                };
                return (0, utils_2.retryAsyncFunction)(executeFn, 5);
            }, {
                maxWait: 20000,
                timeout: 60000,
            }));
        }
        const responses = await Promise.allSettled(prismaTransactionPromises);
        const fulfilledResponses = responses.filter(predicate => predicate.status === 'fulfilled');
        const cnt = fulfilledResponses.reduce((acc, curr) => acc + curr.value.count, 0);
        data.description = `${cnt} Items added successfully to the ${req.headers.department_name} block of Instrument Calibration List.`;
        const rejectedResponses = responses.filter(predicate => predicate.status === 'rejected');
        if (rejectedResponses.length > 0) {
            data.description = `${cnt} Items added successfully to the ${req.headers.department_name} block of Instrument Calibration List. ${newUploadData.length - cnt} Items failed to add.`;
            if (cnt === 0) {
                data.description = `${newUploadData.length - cnt} Items failed to add.`;
            }
        }
        await (0, cfr_helper_1.cfrCreateHelper)({ data: data });
        const t1 = performance.now();
        res.status(201);
        res.json({
            message: data.description,
            totalCount: cnt,
            rejectedReasons: rejectedResponses.map((response) => response.reason),
        });
        // Promise.all(newUploadData).then(async (mapResult: any) => {
        //   const prismaTransaction = await prisma.$transaction(async (tx) => {
        //     const insertResult = await Promise.all(mapResult.map(async (uploadData: any) => {
        //       const executeFn = async () => {
        //         const data = convertToPrismaData(uploadData);
        //         const resp = await tx.instrumentCalibration.create({
        //           data: data,
        //           include: {
        //             std_used: true
        //           }
        //         });
        //         return convertFromPrismaData(resp);
        //       };
        //       return retryAsyncFunction(executeFn, 50);
        //     }));
        //     return insertResult;
        //   }, {
        //     maxWait: 20000,
        //     timeout: 60000
        //   });
        //   
        //   // const insertResult = await prisma.instrumentCalibration.createMany({ data: mapResult });
        //   if (!prismaTransaction) throw new Error('Error inserting InstrumentCalibration.');
        //   res.status(201);
        //   const data: Prisma.cfrCreateInput = {
        //     timestamp: dayjs().valueOf(),
        //     user_name: req.headers.user_name as string,
        //     email: req.headers.email as string,
        //     module: req.headers.module as string,
        //     activity: req.headers.activity as string,
        //     description: req.headers.description as string,
        //     method: req.headers.method as string,
        //     role: req.headers.role as string,
        //     updated_at: dayjs().valueOf(),
        //   };
        //   // 
        //   try {
        //     const result = await cfrCreateHelper({ data: data });
        //     // 
        //   } catch (error) {
        //     next(error);
        //   }
        //   res.json({
        //     prismaTransaction,
        //   });
        // });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function updateMany(req, res, next) {
    const datalist = req.body;
    const cfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        module: 'Instrument Calibration List',
        method: req.method,
        activity: 'UPDATE',
        updated_at: (0, dayjs_1.default)().valueOf(),
    };
    try {
        await index_1.prisma.$transaction(async (tx) => {
            let retryCount = 0;
            const promises = datalist.map(async ({ _id, ...data }) => {
                const executeFn = async () => {
                    retryCount++;
                    const prev = await tx.instrumentCalibration.findUnique({
                        where: { id: _id },
                        include: {
                            std_used: true,
                        },
                    });
                    if (!prev) {
                        res.status(404);
                        throw new Error(`InstrumentCalibration with id "${_id}" not found.`);
                    }
                    const dataToSend = (0, utils_1.convertToPrismaData)(data);
                    await tx.instrumentCalibration.update({
                        where: { id: _id },
                        data: dataToSend,
                        include: {
                            std_used: true,
                        },
                    });
                    data.updated_Schedules = await (0, cal_schedule_handlers_1.updateCalibrationSchedule)({
                        instrument_id: data.instrument_id,
                        instrument_desc: data.instrument_desc,
                        due_date: data.due_date,
                        prev_due_date: prev.due_date,
                    });
                    return data;
                };
                return (0, utils_2.retryAsyncFunction)(executeFn, 50);
            });
            await Promise.all(promises);
        }, {
            maxWait: 20000,
            timeout: 60000,
        });
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        const instStatus = datalist[0]?.status;
        let message;
        if (instStatus === 'ReadyforApproval') {
            message = 'Sent for Approval';
        }
        if (instStatus === 'Active') {
            message = 'approved';
        }
        if (instStatus === 'Draft') {
            message = 'returned';
        }
        if (instStatus === 'Discarded') {
            message = 'dropped';
        }
        if (user) {
            cfrData.user_name = user?.username,
                cfrData.email = user?.email ?? req.body?.email,
                cfrData.role = user?.role;
            cfrData.description = `${datalist.length} records of Calibration Instrument's ${datalist.length > 1 ? 'are' : 'is'} ${message}.`;
            try {
                await (0, cfr_helper_1.cfrCreateHelper)({
                    data: cfrData,
                });
            }
            catch (err) {
            }
        }
        res.json(`${datalist.length} ${datalist.length > 1 ? 'Instruments' : 'Instrument'} ${message} successfully.`);
    }
    catch (error) {
        next(error);
    }
}
exports.updateMany = updateMany;
async function findOne(req, res, next) {
    try {
        const result = await index_1.prisma.instrumentCalibration.findUnique({
            where: { id: req.params.id },
            include: {
                std_used: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
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
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const { std_used = [], ...newDataWithoutStdUsed } = newData;
        const prevRes = await index_1.prisma.instrumentCalibration.findUnique({
            where: {
                id: (req.params.id),
            },
            include: {
                std_used: true,
            },
        });
        if (!prevRes) {
            res.status(404);
            throw new Error('Error Fetching Prev Data.');
        }
        const prev = (0, utils_1.convertFromPrismaData)(prevRes);
        if (std_used.length) {
            await index_1.prisma.std_String.deleteMany({
                where: {
                    instrument_calibration_id: req.params.id,
                },
            });
        }
        const { _id, ...newDataWithoutId } = newData;
        const data = (0, utils_1.convertToPrismaData)(newDataWithoutId);
        const resultRes = await index_1.prisma.instrumentCalibration.update({
            where: {
                id: (req.params.id),
            },
            data: data,
            include: {
                std_used: true,
            },
        });
        if (!resultRes) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
        }
        const result = (0, utils_1.convertFromPrismaData)(resultRes);
        result.updated_Schedules = await (0, cal_schedule_handlers_1.updateCalibrationSchedule)({
            instrument_id: req.body.instrument_id,
            instrument_desc: req.body.instrument_desc,
            due_date: req.body.due_date,
            prev_due_date: prev?.due_date,
        });
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
        const result = await index_1.prisma.instrumentCalibration.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`InstrumentCalibration with id "${req.params.id}" not found.`);
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
        const result = await index_1.prisma.instrumentCalibration.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('InstrumentCalibration  not found.');
        }
        res.json(`${result} records of Instrument Calibration have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=inc-cal.handlers.js.map