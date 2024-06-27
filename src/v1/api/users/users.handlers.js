"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdUser = exports.deleteOne = exports.changePassword = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const mongodb_1 = require("mongodb");
const users_model_1 = require("./users.model");
const activedirectory2_1 = __importDefault(require("activedirectory2"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const sendMain_1 = __importDefault(require("../../emails/sendMain"));
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await users_model_1.Todos.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 }, // Count each document
                },
            },
        ]).toArray();
        res.json(result[0]?.totalCount);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
const trying = async () => {
    console.log();
};
trying();
//
async function findAll(req, res, next) {
    try {
        const todos = (await users_model_1.Todos.find().sort({ created_at: -1 }).toArray()).map((user) => {
            delete user.password;
            return user;
        });
        res.json(todos);
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const pass = req.body.password;
        const password = await bcryptjs_1.default.hash(pass, 10);
        req.body.created_at = (0, dayjs_1.default)().valueOf();
        req.body.phone = req.body.phone.length > 0 ? req.body.phone : 'NA';
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, ['updated_at']);
        const insertResult = await users_model_1.Todos.insertOne({ ...newData, password: password });
        if (!insertResult.acknowledged)
            throw new Error('Error inserting user.');
        (0, sendMain_1.default)(req.body.email, 'CMS - Account Creacted', `Welcome, Your account has been created and your password is ${req.body.password}`)
            .then((emailRes) => {
            res.status(201);
            res.json({
                _id: insertResult.insertedId,
                ...req.body,
            });
        }).catch((err) => {
            res.status(401);
            res.json(err);
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await users_model_1.Todos.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        delete result.password;
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        if (req.body.password != undefined) {
            req.body.password = await bcryptjs_1.default.hash(req.body.password, 10);
        }
        const result = await users_model_1.Todos.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(req.params.id),
        }, {
            $set: req.body,
        }, {
            returnDocument: 'after',
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.json(result.value);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function changePassword(req, res, next) {
    try {
        const user = await users_model_1.Todos.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (req.body.new_password !== undefined && req.body.current_password !== undefined) {
            const match = await bcryptjs_1.default.compare(req.body.current_password, user?.password);
            if (match) {
                if (req.body.new_password === req.body.current_password) {
                    return res.status(401).send('New password and current password should not be same.');
                }
                req.body.password = await bcryptjs_1.default.hash(req.body.new_password, 10);
                delete req.body.current_password;
                delete req.body.new_password;
                delete req.body._id;
                const result = await users_model_1.Todos.findOneAndUpdate({
                    _id: new mongodb_1.ObjectId(req.params.id),
                }, {
                    $set: req.body,
                }, {
                    returnDocument: 'after',
                });
                if (!result.value) {
                    res.status(404);
                    throw new Error(`User with id "${req.params.id}" not found.`);
                }
                res.json(result.value);
            }
            else {
                res.status(401).send('Current password is wrong');
            }
        }
        else {
            res.status(401).send('New password or current password is missing in the request');
        }
    }
    catch (error) {
        next(error);
    }
}
exports.changePassword = changePassword;
async function deleteOne(req, res, next) {
    try {
        const result = await users_model_1.Todos.findOneAndDelete({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!result.value) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
// Ad user
async function getAdUser(req, res, next) {
    const config = {
        url: 'ldap://arizon.local',
        baseDN: 'dc=arizon,dc=local',
        username: 'girish@arizon.local',
        password: 'Arizon@123',
    };
    const ad = new activedirectory2_1.default(config);
    const username = 'girish@arizon.local';
    const password = 'Arizon@123';
    try {
        // this was working / only backend crash some time.
        /*ad.authenticate(username, password, function(err, auth) {
          if (err) {
            
            return;
          }
          
          if (auth) {
            
          }
          else {
            
          }
        });
        */
        //var query = 'cn=*Girish*';
        ad.findUsers(function (err, results) {
            if (err) {
                res.status(404);
                //throw new Error(`AD error : ${err}`);
            }
            else {
                res.json(results);
            }
        });
    }
    catch (error) {
        res.status(404);
        // next(error);
    }
}
exports.getAdUser = getAdUser;
//# sourceMappingURL=users.handlers.js.map