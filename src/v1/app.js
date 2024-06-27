"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const api_1 = __importDefault(require("./api"));
const cfr_1 = require("./middlewares/cfr");
const transaction_1 = require("./middlewares/transaction");
const nosqlApp = (0, express_1.default)();
nosqlApp.use((0, morgan_1.default)('dev'));
nosqlApp.use((0, helmet_1.default)());
nosqlApp.use((0, cors_1.default)());
nosqlApp.use(express_1.default.json({ limit: '15MB' })); //the actual file limit is 10MB ,blob size increase some percent after convertion 
nosqlApp.get('/', (req, res) => {
    res.json({
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    });
});
// nosqlApp.use(middlewares.notFound);
// nosqlApp.use(middlewares.errorHandler);
nosqlApp.use(transaction_1.transactionIntercept);
nosqlApp.use(cfr_1.cfrIntercept);
nosqlApp.use('/api/v1', api_1.default);
exports.default = nosqlApp;
//# sourceMappingURL=app.js.map