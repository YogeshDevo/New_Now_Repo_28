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
exports.StdCalibrationSchedules = exports.StdCalibrationSchedule = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db");
exports.StdCalibrationSchedule = z.object({
    instrument_name: z.any().optional(),
    instrument_id_no: z.any().optional(),
    make: z.any().optional(),
    model_no: z.any().optional(),
    range: z.any().optional(),
    least_count: z.any().optional(),
    category: z.string().optional(),
    frequency: z.string().optional(),
    acceptance_criteria: z.any().optional(),
    cal_date: z.number().optional(),
    due_date: z.number().optional(),
    certificate_no: z.any().optional(),
    status: z.any().optional(),
    qnn: z.string().optional(),
    // certificate_no: z.string().optional(),
    // instument_code: z.string().optional(),
    // make: z.string().optional(),
    // name: z.string().optional(),
    // ref_id: z.string().optional(),
    // si_num: z.string().optional(),
    // validity: z.string().optional()
    updated_at: z.number().optional(),
    remarks: z.string().optional(),
    department_id: z.string().optional(),
    calibration_done_on: z.number().optional(),
    schedule_status: z.string().optional(),
    checked_by: z.string().optional(),
    instrument_object_id: z.string().optional(),
    performed_by: z
        .array(z.object({
        email: z.string().optional(),
        timestamp: z.string().optional(),
        signature: z.string().optional(),
    }))
        .optional(),
});
exports.StdCalibrationSchedules = db_1.db.collection('std_calibration_schedule');
//# sourceMappingURL=std-cal-schedule.model.js.map