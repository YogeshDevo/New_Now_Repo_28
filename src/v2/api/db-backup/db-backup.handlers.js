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
        if (!fs.existsSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`);
        }
        const path = `${process.env.SQLSERVER_DB_BACKUP_PATH}/${Date.now()}cms.bak`;
        const command = `sqlcmd -S ${process.env.SQLSERVER_HOST} -U ${process.env.SQLSERVER_USER} -P ${process.env.SQLSERVER_PASSWORD} -Q "BACKUP DATABASE [${process.env.SQLSERVER_DB_NAME}] TO DISK='${path}'"`;
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
        if (!fs.existsSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`);
        }
        // Read the contents of the backup folder
        const files = fs.readdirSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`);
        res.status(200).json(files);
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_list = db_backup_list;
async function db_backup_restore(req, res, next) {
    try {
        if (!fs.existsSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`)) {
            fs.mkdirSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`);
        }
        const { file_name } = req.body;
        const files = fs.readdirSync(`${process.env.SQLSERVER_DB_BACKUP_PATH}`);
        const fileExists = files.includes(file_name);
        if (!fileExists) {
            return res.status(404).json({ error: 'File not found' });
        }
        const dbName = process.env.SQLSERVER_DB_NAME;
        const dbUser = process.env.SQLSERVER_USER;
        const dbPassword = process.env.SQLSERVER_PASSWORD;
        const dbHost = process.env.SQLSERVER_HOST;
        const filePath = `${process.env.SQLSERVER_DB_BACKUP_PATH}/${file_name}`;
        // remove all connections from the db and then add after restore
        const killToSingleUser = 'sqlcmd -S localhost -U cmsadmin2 -P cmsadmin2 -d master -Q "ALTER DATABASE [gil_cms2] SET SINGLE_USER WITH ROLLBACK IMMEDIATE"';
        const multiUserCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "ALTER DATABASE [${dbName}] SET MULTI_USER"`;
        // start a transaction and rollback if anything fails
        const beginTransactionCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "BEGIN TRANSACTION"`;
        const rollbackCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "ROLLBACK TRANSACTION"`;
        // 
        // 
        // 
        // 
        // FLOW
        // killToSingleUser -> beginTransaction -> dropDB -> createDB -> restoreDB -> multiUser
        // If any error occurs, rollback the transaction
        // Rollback also triggers the multiUser command to allow other users to connect to the database
        const triggerMultiUser = () => {
            (0, child_process_1.exec)(multiUserCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Multi user error:', error);
                }
            });
        };
        const triggerRollback = () => {
            triggerMultiUser();
            (0, child_process_1.exec)(rollbackCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Rollback error:', error);
                }
            });
        };
        const triggerDBrestore = () => {
            // Restore the database
            const restoreDbCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "RESTORE DATABASE [${dbName}] FROM DISK='${filePath}' WITH REPLACE"`;
            (0, child_process_1.exec)(restoreDbCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Restore error:', error);
                    triggerRollback();
                    return res.status(500).json({ error: 'Restore failed' });
                }
                else {
                    triggerMultiUser();
                    return res.json({ message: 'Restore done successfully' });
                }
            });
        };
        const triggerDBcreation = () => {
            // Create new database
            const createDbCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "CREATE DATABASE [${dbName}]"`;
            (0, child_process_1.exec)(createDbCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('DB create error:', error);
                    triggerRollback();
                    return res.status(500).json({ error: 'DB create failed' });
                }
                else {
                    triggerDBrestore();
                }
            });
        };
        const triggerDropDB = () => {
            // Drop the existing database
            const dropCommand = `sqlcmd -S ${dbHost} -U ${dbUser} -P ${dbPassword} -d master -Q "IF EXISTS(SELECT * FROM sys.databases WHERE name = '${dbName}') DROP DATABASE [${dbName}]"`;
            (0, child_process_1.exec)(dropCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('DB drop error:', error);
                    triggerRollback();
                    return res.status(500).json({ error: 'DB drop failed' });
                }
                else {
                    triggerDBcreation();
                }
            });
        };
        const initiateTransaction = () => {
            (0, child_process_1.exec)(beginTransactionCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Begin transaction error:', error);
                    return res.status(500).json({ error: 'Begin transaction failed' });
                }
                else {
                    triggerDropDB();
                }
            });
        };
        (0, child_process_1.exec)(killToSingleUser, (error, stdout, stderr) => {
            if (error) {
                console.error('Kill To Single User error:', error);
                return res.status(500).json({ error: 'Kill To Single User failed' });
            }
            else {
                initiateTransaction();
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_restore = db_backup_restore;
//# sourceMappingURL=db-backup.handlers.js.map