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
const ToleranceHandlers = __importStar(require("./tolerances.handlers"));
const middlewares_1 = require("../../middlewares");
const ParamsWithId_1 = require("../../interfaces/ParamsWithId");
const tolerance_model_1 = require("./tolerance.model");
const router = (0, express_1.Router)();
router.get('/', ToleranceHandlers.findAll);
router.get('/withid', ToleranceHandlers.findAllWithId);
router.post('/', (0, middlewares_1.validateRequest)({
    body: tolerance_model_1.Tolerance,
}), ToleranceHandlers.createOne);
router.delete('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), ToleranceHandlers.deleteOne);
router.put('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
    body: tolerance_model_1.Tolerance,
}), ToleranceHandlers.updateOne);
exports.default = router;
//# sourceMappingURL=tolerance.routes.js.map