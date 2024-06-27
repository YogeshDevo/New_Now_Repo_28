"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const log_file = fs_1.default.createWriteStream('./prisma.log', { flags: 'w' });
exports.prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});
exports.prisma.$on('query', (e) => {
    if (process.env.PRISMA_LOGGING === 'Y') {
        console.log('Timestamp: ', e.timestamp);
        console.log('Query: ' + e.query);
        // console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
        log_file.write(e.timestamp + '\n' + e.query + '\n' + e.params + '\n' + e.duration + 'ms' + '\n' + '================================' + '\n');
    }
});
exports.prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const end = Date.now();
    const duration = end - start;
    if (process.env.PRISMA_LOGGING === 'Y') {
        console.log(params);
        // console.log('Query: ' + params.query);
        // console.log('Params: ' + params.values);
        console.log('Duration: ' + duration + 'ms');
    }
    return result;
});
//# sourceMappingURL=index.js.map