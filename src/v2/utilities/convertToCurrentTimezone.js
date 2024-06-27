"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
async function convertToCurrentTimezone(obj, fields) {
    return new Promise((resolve, reject) => {
        Promise.all(fields.map((field) => {
            obj[field] = (0, dayjs_1.default)().valueOf();
            return field;
        })).then(() => {
            resolve(obj);
        }).catch((err) => {
            reject(err);
        });
    });
}
exports.default = convertToCurrentTimezone;
//# sourceMappingURL=convertToCurrentTimezone.js.map