"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOne = exports.notifyAll = void 0;
const sendMain_1 = __importDefault(require("./sendMain"));
async function notifyAll(users, subject, body) {
    const emailResponse = users.map(async (user) => {
        const emailResponseItem = await (0, sendMain_1.default)(user.email, subject, body);
        return emailResponseItem;
    });
    return emailResponse;
}
exports.notifyAll = notifyAll;
async function notifyOne(user, subject, body) {
    const emailResponse = await (0, sendMain_1.default)(user.email, subject, body);
    return emailResponse;
}
exports.notifyOne = notifyOne;
//# sourceMappingURL=notify.js.map