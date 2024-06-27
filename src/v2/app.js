"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
require('dotenv').config();
// import * as middlewares from './middlewares';
const api_1 = __importDefault(require("./api"));
// import MessageResponse from './interfaces/MessageResponse';
const cfr_1 = require("./middlewares/cfr");
const transaction_1 = require("./middlewares/transaction");
const auth_1 = require("./middlewares/auth");
const debug_log_1 = require("./middlewares/debug-log");
const package_json_1 = require("../../package.json");
const sqlApp = (0, express_1.default)();
const logFile = fs_1.default.createWriteStream('./cms.log', { flags: 'a' }); //use {flags: 'w'} to open in write mode
sqlApp.use((0, morgan_1.default)('combined', { stream: logFile }));
sqlApp.use((0, helmet_1.default)());
sqlApp.use((0, cors_1.default)());
sqlApp.use(express_1.default.json({ limit: '15MB' })); //the actual file limit is 10MB ,blob size increase some percent after convertion 
if (process.env.NODE_ENV === 'production') {
    sqlApp.use('/api/v1', auth_1.AuthIntercept, transaction_1.transactionIntercept, cfr_1.cfrIntercept, debug_log_1.debugLogIntercept, api_1.default);
    sqlApp.use('/', express_1.default.static('public'));
    sqlApp.use('/*', express_1.default.static('public'));
}
else {
    sqlApp.get('/', (req, res) => {
        res.json({
            message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
            version: package_json_1.version,
            releaseNotes: '',
        });
    });
    // sqlApp.use(middlewares.notFound);
    // sqlApp.use(middlewares.errorHandler);
    sqlApp.use(auth_1.AuthIntercept);
    sqlApp.use(transaction_1.transactionIntercept);
    sqlApp.use(cfr_1.cfrIntercept);
    sqlApp.use(debug_log_1.debugLogIntercept);
    sqlApp.use('/api/v1', api_1.default);
}
exports.default = sqlApp;
//# sourceMappingURL=app.js.map