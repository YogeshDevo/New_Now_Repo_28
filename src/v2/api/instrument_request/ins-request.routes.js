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
const InstrumentRequestHandlers = __importStar(require("./ins-request.handlers"));
const ins_request_model_1 = require("./ins-request.model");
const router = (0, express_1.Router)();
router.get('/', InstrumentRequestHandlers.findAll);
router.get('/countAllReq', InstrumentRequestHandlers.countAllReq);
router.get('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), InstrumentRequestHandlers.findOne);
router.post('/', (0, middlewares_1.validateRequest)({
    body: ins_request_model_1.InstrumentRequest,
}), InstrumentRequestHandlers.createOne);
router.post('/many', 
// validateRequest({
//   body: InstrumentRequest,
// }),
InstrumentRequestHandlers.createMany);
router.put('/many', InstrumentRequestHandlers.updateMany);
router.put('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
    body: ins_request_model_1.InstrumentRequest,
}), InstrumentRequestHandlers.updateOne);
// keep the order for "router"
router.delete('/deleteall', InstrumentRequestHandlers.deleteAll);
router.delete('/:id', (0, middlewares_1.validateRequest)({
    params: ParamsWithId_1.ParamsWithId,
}), InstrumentRequestHandlers.deleteOne);
exports.default = router;
//# sourceMappingURL=ins-request.routes.js.map