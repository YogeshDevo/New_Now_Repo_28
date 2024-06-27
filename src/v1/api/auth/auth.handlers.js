"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneLdap = exports.findAllUsersUsingConfig = exports.findAllUsers = exports.findOne = void 0;
const users_model_1 = require("../users/users.model");
const ldap_1 = __importDefault(require("../../utilities/ldap"));
const ldap_2 = require("../../utilities/ldap");
const ldap_3 = require("../../utilities/ldap");
const cfr_model_1 = require("../cfr/cfr.model");
const dayjs_1 = __importDefault(require("dayjs"));
//Count
async function findOne(req, res, next) {
    let LoginLockAttempts = 3;
    if (process.env.LOGIN_LOCK_ATTEMPTS) {
        LoginLockAttempts = parseInt(process.env.LOGIN_LOCK_ATTEMPTS);
    }
    const authCfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        user_name: 'N/A',
        email: 'N/A',
        module: 'Authentication',
        description: `Invalid login attempt for email ${req.body.email}.`,
        method: 'POST',
        role: 'N/A',
        updated_at: (0, dayjs_1.default)().valueOf(),
        activity: 'Invalid Login',
        notify: false,
    };
    try {
        if (process.env.AUTH_TYPE !== 'ldap') {
            try {
                {
                    // Check wheather the user is existing in Users collection.
                    const user = await users_model_1.Todos.findOne({
                        email: req.body.email,
                    });
                    if (!user) {
                        return res.status(401).json({
                            status: '401',
                            message: 'Please ask your admin for CMS access.',
                            user: user,
                        });
                    }
                    res.status(200).json({
                        status: '200',
                        message: 'Login successful',
                        user: {
                            // Include relevant user details in response if needed
                            username: user?.username,
                            email: user?.email,
                            role: user?.role,
                            fname: user?.fname,
                            lname: user?.lname,
                            phone: user?.phone,
                            avatar: user?.avatar,
                            attempt: user?.attempt,
                            qnn: user?.qnn,
                            signature: user?.signature,
                            _id: user?._id,
                        },
                    });
                }
            }
            catch (error) {
                next(error);
            }
        }
        if (process.env.AUTH_TYPE === 'ldap') {
            (0, ldap_1.default)(req.body.email, req.body.password)
                .then(async (ldapResponse) => {
                // Check wheather the user is existing in Users collection.
                const user = await users_model_1.Todos.findOne({
                    email: req.body.email,
                });
                if (!user) {
                    try {
                        await cfr_model_1.Cfrs.insertOne(authCfrData);
                    }
                    catch (error) {
                    }
                    return res.status(401).json({
                        status: '401',
                        message: 'Please ask your admin for CMS access.',
                        user: user,
                    });
                }
                if (user.attempt && user.attempt > LoginLockAttempts) {
                    authCfrData.user_name = user.username;
                    authCfrData.email = user.email;
                    authCfrData.role = user.role;
                    authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is locked.`;
                    try {
                        await cfr_model_1.Cfrs.insertOne(authCfrData);
                    }
                    catch (error) {
                    }
                    return res.status(401).json({
                        message: 'Your account is locked. Please contact admin.',
                    });
                }
                res.status(200).json({
                    status: '200',
                    message: 'Login successful',
                    user: {
                        // Include relevant user details in response if needed
                        username: user?.username,
                        email: user?.email,
                        role: user?.role,
                        fname: user?.fname,
                        lname: user?.lname,
                        phone: user?.phone,
                        avatar: user?.avatar,
                        attempt: user?.attempt,
                        qnn: user?.qnn,
                        signature: user?.signature,
                        groups: ldapResponse,
                        _id: user?._id,
                    },
                });
            })
                .catch(async (err) => {
                if (err && err.email) {
                    const user = await users_model_1.Todos.findOneAndUpdate({ email: err.email }, { $inc: { attempt: 1 } }, { returnDocument: 'after' });
                    if (user && user.value) {
                        authCfrData.user_name = user.value?.username;
                        authCfrData.email = user.value?.email;
                        authCfrData.role = user.value?.role;
                        if (user.value.attempt && user.value.attempt === LoginLockAttempts) {
                            authCfrData.description = `Invalid login attempt for email ${req.body.email} : Exceeded maximum number of failed login attempts.`;
                        }
                        else if (user.value.attempt && user.value.attempt > LoginLockAttempts) {
                            authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is Locked.`;
                        }
                        try {
                            await cfr_model_1.Cfrs.insertOne(authCfrData);
                        }
                        catch (error) {
                            console.log('Cfr not added for invalid login:' + req.body.email);
                        }
                    }
                    if (user && user.value?.attempt && user.value.attempt === LoginLockAttempts) {
                        return res.status(401).json({
                            message: 'Your account has been locked.',
                        });
                    }
                    if (user && user.value?.attempt && user.value.attempt > LoginLockAttempts) {
                        return res.status(401).json({
                            message: 'Your account is locked. Please contact admin.',
                        });
                    }
                    try {
                        await cfr_model_1.Cfrs.insertOne(authCfrData);
                    }
                    catch (error) {
                    }
                    res.status(401).json(err);
                }
                else {
                    res.status(401).json(err);
                }
            });
        }
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function findAllUsers(req, res, next) {
    try {
        const users = await (0, ldap_2.getLDAPUsers)();
        const usersWithEmail = users
            .filter((user) => {
            return user.mail && user.mail !== null;
        })
            .map((user) => {
            const keyValArray = user.dn.split(',');
            const CN = keyValArray[0].split('=')[1];
            const DC1 = keyValArray[2].split('=')[1];
            const DC2 = keyValArray[3].split('=')[1];
            const userWithEmail = {
                ...user,
                // email: `${CN}@${DC1}.${DC2}`
                email: user.mail,
            };
            return userWithEmail;
        });
        // 
        res.status(200).json(usersWithEmail);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllUsers = findAllUsers;
async function findAllUsersUsingConfig(req, res, next) {
    try {
        const config = req.body.config;
        const users = await (0, ldap_3.getLDAPUsersfromConfig)(config);
        const dbusers = await users_model_1.Todos.find({}).toArray();
        const availableUsers = users.filter((user) => {
            const isInDB = dbusers.find((dbu) => dbu.email === user.mail);
            return !isInDB;
        });
        const usersWithEmail = availableUsers
            .filter((user) => {
            return user.mail && user.mail !== null;
        })
            .map((user) => {
            const userWithEmail = {
                ...user,
                // email: `${CN}@${DC1}.${DC2}`
                email: user.mail,
            };
            return userWithEmail;
        });
        // 
        res.status(200).json(usersWithEmail);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllUsersUsingConfig = findAllUsersUsingConfig;
async function findOneLdap(req, res, next) {
    let LoginLockAttempts = 3;
    if (process.env.LOGIN_LOCK_ATTEMPTS) {
        LoginLockAttempts = parseInt(process.env.LOGIN_LOCK_ATTEMPTS);
    }
    const authCfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        user_name: 'N/A',
        email: 'N/A',
        module: 'Authentication',
        description: `Invalid login attempt for email ${req.body.email}.`,
        method: 'POST',
        role: 'N/A',
        updated_at: (0, dayjs_1.default)().valueOf(),
        activity: 'Invalid Login',
        notify: false,
    };
    (0, ldap_1.default)(req.body.email, req.body.password)
        .then(async (ldapResponse) => {
        // Check wheather the user is existing in Users collection.
        const user = await users_model_1.Todos.findOne({
            email: req.body.email,
        });
        if (!user) {
            try {
                await cfr_model_1.Cfrs.insertOne(authCfrData);
            }
            catch (error) {
            }
            return res.status(401).json({
                status: '401',
                message: 'Please ask your admin for CMS access.',
                user: user,
            });
        }
        if (user.attempt && user.attempt >= LoginLockAttempts) {
            authCfrData.user_name = user.username;
            authCfrData.email = user.email;
            authCfrData.role = user.role;
            authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is locked.`;
            try {
                await cfr_model_1.Cfrs.insertOne(authCfrData);
            }
            catch (error) {
            }
            return res.status(401).json({
                message: 'Your account is locked. Please contact admin.',
            });
        }
        res.status(200).json({
            status: '200',
            message: 'Login successful',
            user: {
                // Include relevant user details in response if needed
                username: user?.username,
                email: user?.email,
                role: user?.role,
                fname: user?.fname,
                lname: user?.lname,
                phone: user?.phone,
                avatar: user?.avatar,
                attempt: user?.attempt,
                qnn: user?.qnn,
                signature: user?.signature,
                groups: ldapResponse,
                _id: user?._id,
            },
        });
    })
        .catch(async (err) => {
        if (err && err.email) {
            const user = await users_model_1.Todos.findOneAndUpdate({ email: err.email }, { $inc: { attempt: 1 } }, { returnDocument: 'after' });
            if (user && user.value) {
                authCfrData.user_name = user.value?.username;
                authCfrData.email = user.value?.email;
                authCfrData.role = user.value?.role;
                if (user.value.attempt && user.value.attempt === LoginLockAttempts) {
                    authCfrData.description = `Invalid login attempt for email ${req.body.email} : Exceeded maximum number of failed login attempts.`;
                }
                else if (user.value.attempt && user.value.attempt > LoginLockAttempts) {
                    authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is Locked.`;
                }
                try {
                    await cfr_model_1.Cfrs.insertOne(authCfrData);
                }
                catch (error) {
                    console.log('Cfr not added for invalid login:' + req.body.email);
                }
            }
            if (user && user.value?.attempt && user.value.attempt === LoginLockAttempts)
                return res.status(401).json({
                    message: 'Your account has been locked.',
                });
            if (user && user.value?.attempt && user.value.attempt > LoginLockAttempts)
                return res.status(401).json({
                    message: 'Your account is locked. Please contact admin.',
                });
        }
        try {
            await cfr_model_1.Cfrs.insertOne(authCfrData);
        }
        catch (error) {
        }
        res.status(401).json(err);
    });
}
exports.findOneLdap = findOneLdap;
//# sourceMappingURL=auth.handlers.js.map