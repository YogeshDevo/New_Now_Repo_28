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
exports.Todos = exports.Todo = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db");
exports.Todo = z.object({
    //cal_p_no: z.string().optional(),
    sop_link: z.string().optional(),
    request_type: z.string().optional(),
    request_object_id: z.string().optional(),
    status: z.string().optional(),
    calibration_done: z.number().optional(),
    calibration_due_date: z.number().optional(),
    instrument_desc: z.string().optional(),
    instrument_id: z.string().optional(),
    setpoints_added: z.boolean().optional(),
    instrument_location: z.string().optional(),
    equipment_location: z.string().optional(),
    customer_name: z.string().optional(),
    calibration_done_on_report: z.number().optional(),
    calibration_due_on_report: z.number().optional(),
    // criticality: z.string().optional(),
    calibration_schedule_id: z.string().optional(),
    // model: z.string().optional(),
    // sr_no_report: z.any().optional(),
    range: z.any().optional(),
    accuracy: z.any().optional(),
    room_temp: z.any().optional(),
    relative_humidity: z.any().optional(),
    certificate_no_report: z.any().optional(),
    // validity: z.any().optional(),
    remarks_report: z.string().optional(),
    // calibrated_by: z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    // checked_by: z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    // checked_by_report: z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    performed_by: z
        .array(z.object({
        email: z.string().optional(),
        timestamp: z.string().optional(),
        signature: z.string().optional(),
    }))
        .optional(),
    // reviewed_by: z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    // approved_by: z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    approved_by: z
        .array(z.object({
        email: z.string().optional(),
        timestamp: z.string().optional(),
        signature: z.string().optional(),
    }))
        .optional(),
    // calibration_procedure_num: z.string().optional(),
    // sent_for_verification_by:z.array(z.object( { email: z.string().optional(), timestamp: z.string().optional() }) ).optional(),
    // lowest_reading_for_adjustment: z.number().optional(), // make it lowest_equivalent_reading_for_adjustment
    // reading_coefficient: z.number().optional(), // slope
    // reading_constant: z.number().optional(),
    time_of_calibration: z.number().optional(),
    // time_of_verify: z.number().optional(),
    // time_of_send_verify: z.number().optional(),
    time_of_approval: z.number().optional(),
    // lowest_reading_before_for_adjustment: z.number().optional(), //make it  lowest_equivalent_reading_before_for_adjustment
    // reading_before_coefficient: z.number().optional(), // slope
    // reading_before_constant: z.number().optional(),
    external_calibration: z.boolean().optional(),
    manual_ins_overdue: z.boolean().optional(),
    //date: z.string().optional(),
    //eqp_master_key : z.string().optional(),
    //remarks: z.string().optional(),
    //sap_master_key : z.string().optional(),
    // sr_no: z.number().optional(),
    // master_instrument_name: z.string().optional(),
    // model_no: z.any().optional(), //z.string().optional(),
    // instrument_serial_number: z.any().optional(), //z.string().optional(),
    // next_recommended_due_date: z.any().optional(), // z.string().optional(),
    // template: z.any().optional(), //z.number().optional(),
    // instrument_code_no: z.string().optional(),
    // equipment_sort_field: z.string().optional(),
    // instrument_desc_and_range: z.string().optional(),
    make: z.string().optional(),
    // location: z.string().optional(),
    // equipment_plant: z.string().optional(),
    equipment_desc: z.string().optional(),
    equipment_id: z.string().optional(),
    // operating_range: z.string().optional(),
    frequency: z.string().optional(),
    // order: z.string().optional(),
    // certificate_no: z.string().optional(),
    // calibration_done_on: z.number().optional(), //z.string().optional(),
    //z.string().optional(),
    //z.string().optional(),
    report_type: z.string().optional(),
    standard_details: z
        .array(z.object({
        acceptance_criteria: z.any().optional(),
        cal_date: z.number().optional(),
        certificate_no: z.any().optional(),
        due_date: z.number().optional(),
        instrument_id_no: z.any().optional(),
        instrument_name: z.any().optional(),
        least_count: z.any().optional(),
        make: z.any().optional(),
        model_no: z.any().optional(),
        range: z.any().optional(),
    }))
        .optional(),
    least_count: z.string().optional(),
    least_count_for_report: z.any().optional(),
    // unit_of_measure: z.string().optional(),
    // error_claimed: z.string().optional(),
    remarks: z.any().optional(),
    // description: z.any().optional(),
    // id_no: z.any().optional(),
    // calibrationType: z.string().optional(),
    // calibrationProof: z.string().optional(),
    // calibrationProofTitle: z.string().optional(),
    // calibrationPoints: z.array(z.boolean()).min(4).max(4).optional(),
    set_points: z
        .array(z.object({
        reading: z.any().optional(),
        eq_reading: z.any().optional(),
        before_for_adjustment: z.any().optional(),
        before: z.any().optional(),
        eq_after: z.any().optional(),
        after: z.any().optional(),
    }))
        .optional(),
    //new setpoints
    set_points_table: z
        .array(z.object({
        range: z.any().optional(),
        // error_claimed: z.any().optional(), // multi
        least_count: z.any().optional(),
        unit_of_measure: z.any().optional(),
        eq_unit: z.any().optional(),
        accuracy: z.any().optional(),
        additional_description: z.any().optional(),
        reading_coefficient: z.any().optional(),
        reading_constant: z.any().optional(),
        reading_before_coefficient: z.any().optional(),
        reading_before_constant: z.any().optional(),
        reading1High: z.number().optional(),
        reading1Low: z.number().optional(),
        reading2High: z.number().optional(),
        reading2Low: z.number().optional(),
        readingBefore1High: z.number().optional(),
        readingBefore1Low: z.number().optional(),
        readingBefore2High: z.number().optional(),
        readingBefore2Low: z.number().optional(),
        set_points: z
            .array(z.object({
            reading: z.any().optional(),
            eq_reading: z.any().optional(),
            before_for_adjustment: z.any().optional(),
            before: z.any().optional(),
            eq_after: z.any().optional(),
            after: z.any().optional(),
        }))
            .optional(),
    }))
        .optional(),
    cal_master_id: z.any().optional(),
    updated_at: z.number().optional(),
    department_id: z.string().optional(),
});
exports.Todos = db_1.db.collection('cal-reports');
//# sourceMappingURL=cal-reports.model.js.map