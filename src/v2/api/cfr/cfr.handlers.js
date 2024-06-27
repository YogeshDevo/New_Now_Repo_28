"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOne = exports.updateOne = exports.findOne = exports.createOne = exports.findByYearOrMonth = exports.findAll = exports.pushCfr = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const buildNotification_1 = require("../../emails/buildNotification");
const notify_1 = require("../../emails/notify");
const prisma_1 = require("../../../../prisma");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const convertToIntUser = (user) => {
    const result = {
        ...user,
        _id: user.id,
        password_created: Number(user?.password_created),
        updated_at: Number(user?.updated_at),
        created_at: Number(user?.created_at),
    };
    return result;
};
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
        timestamp: Number(data?.timestamp),
    };
    return result;
};
async function pushCfr(req, res, next) {
    try {
        const t0 = performance.now();
        const len = req.query.length ? parseInt(req.query.length.toString()) : 200;
        const cores = req.query.cores ? parseInt(req.query.cores.toString()) : 10;
        const year = req.query.year ? parseInt(req.query.year.toString()) : 1;
        const dataToInsert = [];
        for (let i = 0; i < len; i++) {
            const now = (0, dayjs_1.default)();
            const xYearAgo = now.subtract(year, 'year');
            const randomNumberOfDays = Math.floor(Math.random() * 365 * year);
            const randomDate = xYearAgo.add(randomNumberOfDays, 'day');
            const time = randomDate.valueOf();
            const data = {
                created_at: time,
                updated_at: time,
                timestamp: time,
                user_name: 'my_userName',
                email: 'my_email@yopmail.com',
                activity: 'My-Activity',
                description: 'Additionally from the alpha module we have removed the loop queries and now we are doing the queries in the backend itself without looping.',
                module: 'Instrument Calibration',
                role: 'admin',
                method: 'POST',
            };
            data.timestamp_year = (0, dayjs_1.default)(data.timestamp).year().toString();
            data.timestamp_year_month = `${(0, dayjs_1.default)(data.timestamp).year().toString()} ${(0, dayjs_1.default)(data.timestamp).month().toString()}`;
            dataToInsert.push(data);
        }
        const batches = [];
        const batchSize = parseInt(process.env.BATCH_SIZE || '1800');
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
            batches.push(dataToInsert.slice(i, i + batchSize));
        }
        let b = 0;
        while (b < batches.length) {
            const promises = [];
            for (let j = 0; j < cores && b < batches.length; j++) {
                const promise = prisma_1.prisma.cfr.createMany({
                    data: batches[b++],
                });
                promises.push(promise);
            }
            await Promise.allSettled(promises);
        }
        const t1 = performance.now();
        res.send({
            msg: len + ' Data Created',
            timeTaken: (t1 - t0) / 1000 + ' s',
            date: new Date(),
        });
    }
    catch (error) {
        next(error);
    }
}
exports.pushCfr = pushCfr;
async function findAll(req, res, next) {
    try {
        const t0 = performance.now();
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate);
        }
        if (startTimestamp && endTimestamp) {
            const where = {
                timestamp: {
                    ...(startTimestamp && { gte: startTimestamp }),
                    ...(endTimestamp && { lt: endTimestamp }),
                },
            };
            const count = await prisma_1.prisma.cfr.count({ where });
            if (count > parseInt(process.env.CFR_DATA_LIMIT || '10000')) {
                return res.status(400).json({
                    message: 'Too Many Records. Please select a different date range.',
                });
            }
            const result = await prisma_1.prisma.cfr.findMany({
                where,
                orderBy: {
                    timestamp: 'desc',
                },
            });
            const dataToSend = result.map(convertToInt);
            const t1 = performance.now();
            return res.json(dataToSend);
        }
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function findByYearOrMonth(req, res, next) {
    try {
        const t0 = performance.now();
        let whereQuery;
        if (req.query.year) {
            whereQuery = {
                timestamp_year: req.query.year
            };
        }
        if (req.query.month) {
            whereQuery = {
                timestamp_year_month: req.query.month
            };
        }
        if (whereQuery) {
            const where = whereQuery;
            const count = await prisma_1.prisma.cfr.count({ where });
            if (count > parseInt(process.env.CFR_DATA_LIMIT || '10000')) {
                return res.status(400).json({
                    message: 'Too Many Records. Please select a different date range.',
                });
            }
            const result = await prisma_1.prisma.cfr.findMany({
                where,
                orderBy: {
                    timestamp: 'desc',
                },
            });
            const dataToSend = result.map(convertToInt);
            const t1 = performance.now();
            return res.json(dataToSend);
        }
        else {
            next(new Error("invalid where query"));
        }
    }
    catch (error) {
        next(error);
    }
}
exports.findByYearOrMonth = findByYearOrMonth;
async function createOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at', 'created_at']);
        newData.timestamp_year = (0, dayjs_1.default)(newData.timestamp).year().toString();
        newData.timestamp_year_month = `${(0, dayjs_1.default)(newData.timestamp).year().toString()} ${(0, dayjs_1.default)(newData.timestamp).month().toString()}`;
        const insertResult = await prisma_1.prisma.cfr.create({ data: newData });
        if (!insertResult)
            throw new Error('Error inserting Cfr.');
        const notificationData = await (0, buildNotification_1.buildOneNotification)(req.body);
        if (notificationData && process.env.NOTIFY === 'Y' && req.body.notify) {
            await (0, notify_1.notifyOne)(req.body, notificationData.subject, notificationData.body);
        }
        const notificationDataAll = await (0, buildNotification_1.buildAllNotification)(req.body);
        if (notificationDataAll && process.env.NOTIFY === 'Y' && req.body.notify) {
            // ---------------------------------------------------------------
            // const approvers = await Todos.find({ role: 'approver' }).toArray();
            const approversRes = await prisma_1.prisma.user.findMany({ where: { role: 'approver' } });
            const approvers = approversRes.map((app) => convertToIntUser(app));
            // ---------------------------------------------------------------
            await (0, notify_1.notifyAll)(approvers, notificationDataAll.subject, notificationDataAll.body);
        }
        res.status(201);
        res.json({
            newData,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.cfr.findFirst({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.cfr.update({
            where: {
                id: (req.params.id),
            },
            data: req.body,
        });
        if (!result) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.cfr.delete({
            where: {
                id: (req.params.id),
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Cfr with id "${req.params.id}" not found.`);
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
        const result = await prisma_1.prisma.cfr.deleteMany({});
        if (!result) {
            res.status(404);
            throw new Error('Cfr  not found.');
        }
        res.json(`${result.count} records of cfr have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=cfr.handlers.js.map