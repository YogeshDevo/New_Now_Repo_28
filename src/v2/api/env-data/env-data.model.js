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
exports.EnvData = void 0;
const z = __importStar(require("zod"));
exports.EnvData = z.object({
    MONGO_URI: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.number(),
    SMTP_EMAIL: z.string().email(),
    SMTP_PASS: z.string(),
    AUTH_TYPE: z.string(),
    PORT: z.number(),
    SEED: z.string(),
    NOTIFY: z.string(),
    DATABASE_URL: z.string(),
    TO_EMAIL_SUPPORT: z.string().email(),
    FROM_EMAIL_SUPPORT: z.string().email(),
    CRON: z.string(),
    TEST_CRON: z.string(),
    API_VERSION: z.string(),
    LOGIN_LOCK_ATTEMPTS: z.number(),
    MYSQL_USER: z.string(),
    MYSQL_PASSWORD: z.string(),
    MYSQL_DB_NAME: z.string(),
    MYSQL_DB_BACKUP_PATH: z.string(),
    SQLSERVER_HOST: z.string(),
    SQLSERVER_USER: z.string(),
    SQLSERVER_PASSWORD: z.string(),
    SQLSERVER_DB_NAME: z.string(),
    SQLSERVER_DB_BACKUP_PATH: z.string(),
    JWT_SECRET: z.string(),
    SUPER_ADMIN_USERNAME: z.string(),
    SUPER_ADMIN_PASSWORD: z.string(),
    PRISMA_OPTIMIZE: z.string(),
    PRISMA_LOGGING: z.string(),
    NODE_ENV: z.string(),
    QA_KEY: z.string(),
    SEED_USER: z.string(),
});
//# sourceMappingURL=env-data.model.js.map