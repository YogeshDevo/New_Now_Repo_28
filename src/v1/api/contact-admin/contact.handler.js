"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOne = exports.findAll = void 0;
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const contact_model_1 = require("./contact.model");
const sendMain_1 = require("../../emails/sendMain");
const temp_contact_1 = __importDefault(require("../../emails/templates/temp-contact"));
async function findAll(req, res, next) {
    try {
        const result = await contact_model_1.ContactAdmins.find().sort({ created_at: -1 }).toArray();
        res.status(200).json(result);
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
        const insertResult = await contact_model_1.ContactAdmins.insertOne(newData);
        if (!insertResult.acknowledged)
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