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
const express_1 = require("express");
const ParamsWithId_1 = require("../../interfaces/ParamsWithId");
const middlewares_1 = require("../../middlewares");
const CalibrationScheduleHandlers = __importStar(require("./cal-schedule.handlers"));
const cal_schedule_model_1 = require("./cal-schedule.model");
const router = (0, express_1.Router)();
router.get('/count', CalibrationScheduleHandlers.findAllCount);
router.get('/allcount', CalibrationScheduleHandlers.getMachineCounts);
router.get('/', CalibrationScheduleHandlers.findAll);
router.get('/jobs', CalibrationScheduleHandlers.findAllJobs);
router.get('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), CalibrationScheduleHandlers.findOne);
router.post('/', (0, middlewares_1.validateRequest)({
    body: cal_schedule_model_1.CalibrationSchedule,
}), CalibrationScheduleHandlers.createOne);
router.post('/many', CalibrationScheduleHandlers.createMany);
router.put('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
    body: cal_schedule_model_1.CalibrationSchedule,
}), CalibrationScheduleHandlers.updateOne);
// keep the order for "router"
router.delete('/deleteall', CalibrationScheduleHandlers.deleteAll);
router.delete('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), CalibrationScheduleHandlers.deleteOne);
exports.default = router;
//# sourceMappingURL=cal-schedule.routes.js.map