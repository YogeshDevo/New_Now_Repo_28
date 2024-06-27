"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOne = exports.findAll = void 0;
const prisma_1 = require("../../../../prisma");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const sendMain_1 = require("../../emails/sendMain");
const temp_contact_1 = __importDefault(require("../../emails/templates/temp-contact"));
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
        const result = await prisma_1.prisma.contactAdmin.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        const dataToSend = result.map((res) => convertToInt(res));
        res.json(dataToSend);
    }
    catch (error) {
        if (error instanceof Error) {
            error.message = 'Error fetching Contact Admin Messages.';
            res.send(error);
        }
        next(error);
    }
}
exports.findAll = findAll;
async function sendOne(req, res, next) {
    try {
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['created_at']);
        const insertResult = await prisma_1.prisma.contactAdmin.create({ data: newData });
        if (!insertResult)
            throw new Error('Error inserting Contact Admin Message.');
        const { email, subject, message } = req.body;
        await sendMain_1.transporter.sendMail({
            from: process.env.FROM_EMAIL_SUPPORT,
            to: process.env.TO_EMAIL_SUPPORT,
            subject: subject,
            html: (0, temp_contact_1.default)(email, message),
        });
        res.status(201).json({
            ...req.body,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.sendOne = sendOne;
//# sourceMappingURL=contact.handler.js.map