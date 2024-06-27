"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfrCreateHelper = void 0;
const prisma_1 = require("../../../../prisma");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
async function cfrCreateHelper(input) {
    const cfrData = input.data;
    cfrData.timestamp_year = (0, dayjs_1.default)(cfrData.timestamp).year().toString();
    cfrData.timestamp_year_month = `${(0, dayjs_1.default)(cfrData.timestamp).year().toString()} ${(0, dayjs_1.default)(cfrData.timestamp).month().toString()}`;
    return prisma_1.prisma.cfr.create({
        data: cfrData,
    });
}
exports.cfrCreateHelper = cfrCreateHelper;
//# sourceMappingURL=cfr.helper.js.map