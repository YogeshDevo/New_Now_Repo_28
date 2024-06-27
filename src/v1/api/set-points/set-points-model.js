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
exports.SetPoints = exports.SetPoint = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db");
exports.SetPoint = z.object({
    // instrument_desc: z.string().optional(),
    // instrument_id:  z.string().optional(),
    // instrument_location:  z.string().optional(),
    // make:  z.string().optional(),
    // range: z.string().optional(),
    // least_count: z.string().optional(), //z.number().optional() ,
    // category:  z.string().optional(),
    // equipment_desc: z.string().optional(),
    // equipment_id:  z.string().optional(),
    // equipment_location:  z.string().optional(),
    // error_claimed: z.string().optional(),
    // set_points: z.array(z.any().optional()).optional(),
    // qnn: z.string().optional(),
    // updated_at: z.number().optional(),
    // New Schema
    instrument_desc: z.string().optional(),
    range: z.string().optional(),
    unit: z.string().optional(),
    set_points: z.array(z.any().optional()).optional(),
    qnn: z.string().optional(),
    updated_at: z.number().optional(),
    department_id: z.string().optional(),
});
exports.SetPoints = db_1.db.collection('Set-Point');
//# sourceMappingURL=set-points-model.js.map