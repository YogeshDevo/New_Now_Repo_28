"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./v2/app"));
const app_2 = __importDefault(require("./v1/app"));
// import seedSQL from './v2/utilities/seed';
const execute_1 = __importDefault(require("./v2//utilities/execute"));
require('dotenv').config();
const http = require('http');
const server = http.createServer(process.env.API_VERSION === 'v1' ? app_2.default : app_1.default);
const port = process.env.PORT || 5001;
const cron_1 = require("./v1/utilities/cron");
const cron_2 = require("./v2/utilities/cron");
// var io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//   }
// });
// Other server setup code...
// export { io };
server.listen(port, () => {
    /* eslint-disable no-console */
    // if (process.env.SEED === 'Y') {
    //   process.env.API_VERSION === 'v1' ? seedMongo() : seedSQL();
    // }
    console.log(`connected to db ${process.env.DATABASE_URL}`);
    if (process.env.CRON === 'Y') {
        if (process.env.API_VERSION === 'v1') {
            (0, cron_1.startCron)();
        }
        else {
            (0, cron_2.startCron)();
        }
    }
    if (process.env.PRISMA_LOGGING === 'Y') {
        (0, execute_1.default)();
    }
    /* eslint-enable no-console */
});
//# sourceMappingURL=index.js.map