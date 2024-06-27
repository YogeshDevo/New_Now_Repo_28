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
const TodoHandlers = __importStar(require("./cal-reports.handlers"));
const set_points_table_handlers_1 = require("./set-points-table.handlers");
const cal_reports_opt_handlers_1 = require("./cal-reports-opt.handlers");
const cal_reports_model_1 = require("./cal-reports.model");
const router = (0, express_1.Router)();
//
router.get('/count', TodoHandlers.findAllCount);
//
router.get('/', TodoHandlers.findAll);
router.get('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), TodoHandlers.findOne);
router.post('/', (0, middlewares_1.validateRequest)({
    body: cal_reports_model_1.Todo,
}), TodoHandlers.createOne);
router.post('/create-report', cal_reports_opt_handlers_1.createReport);
router.delete('/delete-report/:id', cal_reports_opt_handlers_1.deleteReport);
router.put('/sent-for-approval/:id', cal_reports_opt_handlers_1.sendForApproval);
router.put('/return-report/:id', cal_reports_opt_handlers_1.returnReport);
router.put('/approve-report/:id', cal_reports_opt_handlers_1.approveReport);
router.post("/set-points-table", set_points_table_handlers_1.createSetPointsTable);
router.put("/set-points-table/:id", set_points_table_handlers_1.updateSetPointsTable);
router.post("/set-points", set_points_table_handlers_1.createSetPoints);
router.put('/set-points/:id', set_points_table_handlers_1.updateSetPoints);
router.put("/return-many", cal_reports_opt_handlers_1.bulkReturnReport);
router.put("/approve-many", cal_reports_opt_handlers_1.bulkApproveReport);
router.put('/many', 
// validateRequest({
//   body: Todo,
// }),
TodoHandlers.updateMany);
router.put('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
    body: cal_reports_model_1.Todo,
}), TodoHandlers.updateOne);
router.put("/updatern/:id", 
// validateRequest({
//   params: ParamsWithId,
//   body: Todo,
// }),
cal_reports_opt_handlers_1.updateOneRN);
router.post('/:id/reset', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
    body: cal_reports_model_1.Todo,
}), TodoHandlers.resetOne);
// keep the order for "router"
router.delete('/deleteall', TodoHandlers.deleteAll);
router.delete('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), TodoHandlers.deleteOne);
exports.default = router;
//# sourceMappingURL=cal-reports.routes.js.map