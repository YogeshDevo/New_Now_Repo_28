"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateMany = exports.updateOne = exports.findOne = exports.createMany = exports.createOne = exports.findAll = exports.findByPage = exports.getMachineCounts = exports.findAllCount = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("../../../../prisma");
const utils_1 = require("../../utils");
const cfr_helper_1 = require("../cfr/cfr.helper");
// import { io } from '../..';
// let changeStream: ChangeStream;
//Count
const jwt = require("jsonwebtoken");
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        due_date: Number(data?.due_date),
        cal_date: Number(data?.cal_date),
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
async function findAllCount(req, res, next) {
    try {
        const totalCount = await prisma_1.prisma.instrumentMaster.count();
        res.json(totalCount);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = Todos.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<Todo>) => {
//       // Emit the change to connected clients
//       //
//       io.emit('master', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
const getMachineCounts = async (req, res) => {
    try {
        const result = await prisma_1.prisma.instrumentMaster.findMany({
            orderBy: {
                updated_at: "desc",
            },
        });
        const countStatus = {
            Draft: 0,
            Active: 0,
            InCalibration: 0,
            Removed: 0,
            "Ready for Approval": 0,
        };
        result.forEach((count) => {
            const status = count.status || "";
            if (status in countStatus) {
                countStatus[status] = countStatus[status] + 1;
            }
        });
        res.json(countStatus);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getMachineCounts = getMachineCounts;
async function findByPage(req, res, next) {
    try {
        const t0 = performance.now();
        const status = req.query.status?.toString() ?? undefined;
        const department_id = req.query.department_id?.toString() ?? undefined;
        const page = parseInt(req.query.page?.toString() ?? "1");
        const limit = parseInt(req.query.limit?.toString() ?? "10");
        const where = {
            status,
            department_id,
        };
        const dataPromise = prisma_1.prisma.instrumentMaster.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                updated_at: "desc",
            },
        });
        const countPromise = prisma_1.prisma.instrumentMaster.count({ where });
        const [data, count] = await Promise.all([dataPromise, countPromise]);
        const dataToSend = data.map((res) => convertToInt(res));
        const t1 = performance.now();
        res.json({ data: dataToSend, count });
    }
    catch (error) {
        next(error);
    }
}
exports.findByPage = findByPage;
async function findAll(req, res, next) {
    try {
        // setupChangeStream();
        const todos = await prisma_1.prisma.instrumentMaster.findMany({
            orderBy: {
                updated_at: "desc",
            },
        });
        const data = todos.map((user) => {
            return convertToInt(user);
        });
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            "updated_at",
        ]);
        const insertResult = await prisma_1.prisma.instrumentMaster.create({
            data: newData,
        });
        if (!insertResult)
            throw new Error("Error inserting todo.");
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
async function createMany(req, res, next) {
    try {
        //
        //
        const t0 = performance.now();
        const newUploadData = await Promise.all(req.body.uploadData.map(async (data) => {
            data = await (0, convertToCurrentTimezone_1.default)(data, [
                "updated_at",
                "created_at",
            ]);
            return data;
        }));
        const resIns = await prisma_1.prisma.$transaction(async (tx) => {
            const resp = await tx.instrumentMaster.createMany({
                data: newUploadData,
            });
            return resp;
        }, {
            maxWait: 20000,
            timeout: 60000,
        });
        if (!resIns.count)
            throw new Error("Error inserting InstrumentCalibration.");
        res.status(201);
        const data = {
            timestamp: (0, dayjs_1.default)().valueOf(),
            user_name: req.headers.user_name,
            email: req.headers.email,
            module: req.headers.module,
            activity: req.headers.activity,
            description: `${resIns.count} Items added successfully to the ${req.headers.department_name} Block of Standard Instrument List.`,
            method: req.headers.method,
            role: req.headers.role,
            updated_at: (0, dayjs_1.default)().valueOf(),
        };
        const result = await (0, cfr_helper_1.cfrCreateHelper)({ data: data });
        const t1 = performance.now();
        res.json({
            totalCount: resIns.count,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createMany = createMany;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentMaster.findFirst({
            where: {
                id: req.params.id,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
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
        const { _id, ...data } = req.body;
        const result = await prisma_1.prisma.instrumentMaster.update({
            where: {
                id: req.params.id,
            },
            data: data,
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.json(convertToInt(result));
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function updateMany(req, res, next) {
    const datalist = req.body;
    // only applicable for updateMany
    const cfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        module: "Standard Instrument List",
        method: req.method,
        activity: "UPDATE",
        updated_at: (0, dayjs_1.default)().valueOf(),
    };
    try {
        await prisma_1.prisma.$transaction(async (tx) => {
            const promises = datalist.map(async ({ _id, ...data }) => {
                const executeFn = async () => {
                    const prev = await tx.instrumentMaster.findUnique({
                        where: { id: _id },
                    });
                    if (!prev) {
                        res.status(404);
                        throw new Error(`Master Instrument with id "${_id}" not found.`);
                    }
                    const dataToSend = convertToInt(data);
                    const newData = await tx.instrumentMaster.update({
                        where: { id: _id },
                        data: dataToSend,
                    });
                    return newData;
                };
                return (0, utils_1.retryAsyncFunction)(executeFn, 50);
            });
            await Promise.all(promises);
        }, {
            maxWait: 20000,
            timeout: 60000, // default: 5000
        });
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        const instStatus = datalist[0]?.status;
        let message;
        if (instStatus === 'Ready for Approval') {
            // message = 'verified';
            message = 'Sent for Approval';
        }
        else if (instStatus === 'Active') {
            message = 'approved';
        }
        else if (instStatus === 'Draft') {
            message = 'returned';
        }
        else if (instStatus === 'Discarded') {
            message = 'dropped';
        }
        if (user) {
            cfrData.user_name = user?.username,
                cfrData.email = user?.email ?? req.body?.email,
                cfrData.role = user?.role;
            cfrData.description = `${datalist.length} records of Standard Instrument's ${datalist.length > 1 ? 'are' : 'is'} ${message} by ${user.username}.`;
            try {
                await (0, cfr_helper_1.cfrCreateHelper)({
                    data: cfrData,
                });
            }
            catch (err) {
            }
        }
        res.json(`${datalist.length} ${datalist.length > 1 ? "Standard Instruments" : "Standard Instrument"} ${message} successfully.`);
    }
    catch (error) {
        next(error);
    }
}
exports.updateMany = updateMany;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentMaster.delete({
            where: {
                id: req.params.id,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.status(204).json("Deleted.").end();
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
async function deleteAll(req, res, next) {
    try {
        const result = await prisma_1.prisma.instrumentMaster.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error("InstrumentMaster  not found.");
        }
        res.json(`${result?.count} records of Instrument(Eqp) Master have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=ins_master.handlers.js.map