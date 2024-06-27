"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalibrationSchedules = exports.CalibrationSchedule = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db");
exports.CalibrationSchedule = z.object({
    instrument_desc: z.string().optional(),
    instrument_id: z.string().optional(),
    instrument_location: z.string().optional(),
    make: z.string().optional(),
    range: z.string().optional(),
    least_count: z.string().optional(),
    category: z.string().optional(),
    frequency: z.string().optional(),
    error_claimed: z.string().optional(),
    calibration_done_on: z.number().optional(),
    due_date: z.number().optional(),
    equipment_desc: z.string().optional(),
    equipment_id: z.string().optional(),
    equipment_location: z.string().optional(),
    status: z.string().optional(),
    certificate_no: z.string().optional(),
    schedule_status: z.string().optional(),
    checked_by: z.string().optional(),
    instrument_object_id: z.string().optional(),
    qnn: z.string().optional(),
    std_used: z.array(z.string()).optional(),
    performed_by: z.array(z.object({ email: z.string().optional(), timestamp: z.string().optional(), signature: z.string().optional() })).optional(),
    updated_at: z.number().optional(),
    department_id: z.string().optional(),
});
exports.CalibrationSchedules = db_1.db.collection('calibration_schedule');
//# sourceMappingURL=cal-schedule.model.js.map