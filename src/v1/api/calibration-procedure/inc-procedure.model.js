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
exports.InstrumentProcedures = exports.InstrumentProcedure = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db");
exports.InstrumentProcedure = z.object({
    title: z.string().optional(),
    procedure_no: z.any().optional(),
    version_no: z.any().optional(),
    vendor_name: z.any().optional(),
    pdf_title: z.string().optional(),
    pdf_data: z.string().optional(),
    updated_at: z.number().optional(),
});
exports.InstrumentProcedures = db_1.db.collection('instrument_procedure');
//# sourceMappingURL=inc-procedure.model.js.map