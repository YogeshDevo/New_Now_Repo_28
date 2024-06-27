"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLogIntercept = void 0;
const fs_1 = __importDefault(require("fs"));
const jwt = require('jsonwebtoken');
const logFile = fs_1.default.createWriteStream('./debug.log', { flags: 'w' });
async function debugLogIntercept(req, res, next) {
    let logData = '';
    if (req.headers.authorization) {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        if (req.method === 'POST' || req.method === 'PUT') {
            logData = `${req.url} - ${req.method} has been called with following data \n ${JSON.stringify(req.body)} \n by ${decodedUser.email} | ${decodedUser._id}`;
        }
        else {
            logData = `${req.url} - ${req.method} has been called by ${decodedUser.email} | ${decodedUser._id}`;
        }
    }
    else {
        if (req.method === 'POST' || req.method === 'PUT') {
            logData = `${req.url} - ${req.method} has been called with following data \n ${JSON.stringify(req.body)} \n by an unauthorized user`;
        }
        else {
            logData = `${req.url} - ${req.method} has been called by an unauthorized user`;
        }
    }
    logFile.write(logData + '\n' + '===================' + '\n' + `Timestamp: ${new Date()}` + '\n' + '===================' + '\n');
    next();
}
exports.debugLogIntercept = debugLogIntercept;
//# sourceMappingURL=debug-log.js.map