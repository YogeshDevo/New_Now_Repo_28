"use strict";
// do error handling in two POST apis. (PM2 can manage);
// need to kill 'execFile'. (if we face RAM issues)
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
const mongodb_snapshot_1 = require("mongodb-snapshot");
const fs = __importStar(require("fs"));
const db_1 = require("../../db");
async function db_backup_create(req, res, next) {
    // async function dumpMongo2Localfile() {
    //     const mongo_connector = new MongoDBDuplexConnector({
    //         connection: {
    //             uri: 'mongodb://127.0.0.1:27017',//`mongodb://${req.body.username}:${req.body.password}@${req.body.host}:${req.body.port}`,
    //             dbname: `cms`,
    //         },
    //     });
    //     const localfile_connector = new LocalFileSystemDuplexConnector({
    //         connection: {
    //             path: `C:/MONGO_DB_BACKUP/cms.tar`,
    //         },
    //     });
    //     const transferer = new MongoTransferer({
    //         source: mongo_connector,
    //         targets: [localfile_connector],
    //     });
    //     for await (const { total, write } of transferer) {
    //         
    //         if ((total - write) === 0) {
    //             localfile_connector.close();
    //             mongo_connector.close()
    //             return "successfull"
    //         }
    //     }
    // }
    //
    // execFile('mongodump', ['-d', 'cms', '-o', `C:\\MONGO_DB_BACKUP\\${Date.now()}cms`], (error, stdout, stderr) => {
    //     if (error) {
    //         
    //         res.status(404);
    //         //throw new Error(`Backup not done. Check Db name / port`);
    //         res.json(`Backup failed`);
    //     }
    //     //
    //     //
    //     res.json(`Backup done successfully`);
    // });
    //
    async function dumpMongo2Localfile() {
        const mongoCString = 'mongodb://127.0.0.1:27017';
        const dbname = 'cms-GIL';
        const backup_path = `C:/mongoDB_Backup/${Date.now()}cms.tar`;
        const mongo_connector = new mongodb_snapshot_1.MongoDBDuplexConnector({
            connection: {
                //  uri: `mongodb://<username>:<password>@<hostname>:<port>`,
                //  dbname: '<database-name>',
                uri: mongoCString,
                dbname: dbname,
            },
        });
        const localfile_connector = new mongodb_snapshot_1.LocalFileSystemDuplexConnector({
            connection: {
                path: backup_path,
            },
        });
        try {
            const transferer = new mongodb_snapshot_1.MongoTransferer({
                source: mongo_connector,
                targets: [localfile_connector],
            });
            let flag = false;
            for await (const { total, write } of transferer) {
                flag = (total - write) === 0;
            }
            return flag;
        }
        catch (error) {
            return false;
        }
    }
    try {
        const results = await dumpMongo2Localfile();
        // if (!results) {
        //     res.status(404);
        //     throw new Error(`Backup not done. Check Db name / port`);
        // }
        if (results) {
            res.json('Backup done successfully');
        }
        else {
            res.json('Failed to Backup');
        }
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_create = db_backup_create;
async function db_backup_list(req, res, next) {
    fs.readdir('C:/mongoDB_Backup', (err, list) => {
        if (list) {
            res.json(list);
        }
        else {
            res.status(404);
            throw new Error(`Error: + ${err}`);
        }
    });
}
exports.db_backup_list = db_backup_list;
async function db_backup_restore(req, res, next) {
    // execFile('mongorestore', [`C:\\MONGO_DB_BACKUP\\${req.body.file_name}`], (error, stdout, stderr) => {  // here file_name is foldername
    //     if (error) {
    //         
    //         res.status(404);
    //         //throw new Error(`Backup not done. Check Db name / port`);
    //         res.json(`restore failed`);
    //     }
    //     //
    //    // 
    //     res.json(`restore done successfully`);
    // });
    // Step first delete old one
    if (db_1.client.db().databaseName === 'cms-GIL') {
        db_1.db.dropDatabase(function (err, delOK) {
            if (err)
                throw err;
        });
    }
    // Step Second restore
    // async function restoreLocalfile2Mongo() {
    //     const backupFile = `C:/MONGO_DB_BACKUP/${req.body.file_name}`;
    //     const mongo_connector = new MongoDBDuplexConnector({
    //         connection: {
    //             uri: 'mongodb://127.0.0.1:27017',//`mongodb://${req.body.username}:${req.body.password}@${req.body.host}:${req.body.port}`,
    //             dbname: `${req.body.db}`,
    //         },
    //     });
    //     if (fs.existsSync(backupFile)) {
    //         const localfile_connector = new LocalFileSystemDuplexConnector({
    //             connection: {
    //                 path: `C:/MONGO_DB_BACKUP/cms.tar`,
    //             },
    //         });
    //         const transferer = new MongoTransferer({
    //             source: localfile_connector,
    //             targets: [mongo_connector],
    //         });
    //         for await (const { total, write } of transferer) {
    //             
    //             if ((total - write) === 0) {
    //                 return "successfull"
    //             }
    //         }
    //     } else {
    //         return `file not found`
    //     }
    // }
    const backupFile = `C:/mongoDB_Backup/${req.body.file_name}`;
    const mongoCString = 'mongodb://127.0.0.1:27017';
    const dbname = 'cms-GIL';
    async function restoreLocalfile2Mongo() {
        const mongo_connector = new mongodb_snapshot_1.MongoDBDuplexConnector({
            connection: {
                uri: mongoCString,
                dbname: `${req.body.db}`,
            },
        });
        const localfile_connector = new mongodb_snapshot_1.LocalFileSystemDuplexConnector({
            connection: {
                // path: './backup.tar',
                // path: `C:/MONGO_DB_BACKUP/backup.tar`,
                path: backupFile,
            },
        });
        const transferer = new mongodb_snapshot_1.MongoTransferer({
            source: localfile_connector,
            targets: [mongo_connector],
        });
        try {
            let flag = false;
            for await (const { total, write } of transferer) {
                flag = (total - write) === 0;
            }
            return flag;
        }
        catch (error) {
            return false;
        }
    }
    try {
        const results = await restoreLocalfile2Mongo();
        // if (!results) {
        //     res.status(404);
        //     throw new Error(`Restore not done. Check Db name , port , backup file ...`);
        // } else if (results === 'file not found') {
        //     res.status(404);
        //     throw new Error(`${req.body.file_name},:- Backup file not found`);
        // }
        if (results) {
            res.json('Restore is successfully');
        }
        else {
            res.json('Failed to Restore');
        }
    }
    catch (error) {
        next(error);
    }
}
exports.db_backup_restore = db_backup_restore;
//# sourceMappingURL=db-backup.handlers.js.map