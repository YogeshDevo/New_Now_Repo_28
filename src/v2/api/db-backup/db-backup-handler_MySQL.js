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
exports.db_backup_restore = exports.db_backup_list = exports.db_backup_create = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
async function db_backup_create(req, res, next) {
    try {
        if (!fs.existsSync(`${process.env.MYSQL_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.MYSQL_DB_BACKUP_PATH}`);
        }
        const path = `${process.env.MYSQL_DB_BACKUP_PATH}/${Date.now()}cms.sql`;
        const command = `mysqldump -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DB_NAME} > ${path}`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Backup error:', error);
                res.status(500).json({ error: 'Backup failed' });
            }
            else {
                res.json({ message: 'Backup done successfully', path });
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_create = db_backup_create;
async function db_backup_list(req, res, next) {
    try {
        if (!fs.existsSync(`${process.env.MYSQL_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.MYSQL_DB_BACKUP_PATH}`);
        }
        // Read the contents of the backup folder
        const files = fs.readdirSync(`${process.env.MYSQL_DB_BACKUP_PATH}`);
        res.status(200).json(files);
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_list = db_backup_list;
async function db_backup_restore(req, res, next) {
    try {
        if (!fs.existsSync(`${process.env.MYSQL_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.MYSQL_DB_BACKUP_PATH}`);
        }
        const { file_name } = req.body;
        const files = fs.readdirSync(`${process.env.MYSQL_DB_BACKUP_PATH}`);
        const fileExists = files.includes(file_name);
        if (!fileExists) {
            return res.status(404).json({ error: 'File not found' });
        }
        // Drop the existing database
        const dropCommand = `mysql -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} -e "DROP DATABASE IF EXISTS ${process.env.MYSQL_DB_NAME}"`;
        (0, child_process_1.exec)(dropCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('DB drop error:', error);
                return res.status(500).json({ error: 'DB drop failed' });
            }
            else {
                // Create new database
                const createDbCommand = `mysql -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB_NAME}"`;
                (0, child_process_1.exec)(createDbCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('DB create error:', error);
                        return res.status(500).json({ error: 'DB create failed' });
                    }
                    else {
                        // Restore the database
                        const path = `${process.env.MYSQL_DB_BACKUP_PATH}/${file_name}`;
                        const restoreDbCommand = `mysql -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DB_NAME} < ${path}`;
                        (0, child_process_1.exec)(restoreDbCommand, (error, stdout, stderr) => {
                            if (error) {
                                console.error('Restore error:', error);
                                return res.status(500).json({ error: 'Restore failed' });
                            }
                            else {
                                res.json({ message: 'Restore done successfully' });
                            }
                        });
                    }
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_restore = db_backup_restore;
//# sourceMappingURL=db-backup-handler_MySQL.js.map