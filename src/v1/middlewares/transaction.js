"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionIntercept = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
async function transactionIntercept(req, res, next) {
    if (req.method === 'PUT' && req.body && req.body.updated_at) {
        req.body.updated_at = (0, dayjs_1.default)().valueOf();
        next();
    }
    else {
        next();
    }
}
exports.transactionIntercept = transactionIntercept;
//# sourceMappingURL=transaction.js.map