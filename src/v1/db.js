"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = void 0;
const mongodb_1 = require("mongodb");
const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://127.0.0.1:27017/cms-GIL';
exports.client = new mongodb_1.MongoClient(MONGO_URI);
exports.db = exports.client.db();
//# sourceMappingURL=db.js.map