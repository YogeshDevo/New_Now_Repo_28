"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneLdap = exports.findAllUsersUsingConfig = exports.findAllUsers = exports.findOne = exports.qaVerify = void 0;
const ldap_1 = __importDefault(require("../../utilities/ldap"));
const prisma_1 = require("../../../../prisma");
const dayjs_1 = __importDefault(require("dayjs"));
const ldap_2 = require("../../utilities/ldap");
const ldap_3 = require("../../utilities/ldap");
const cfr_helper_1 = require("../cfr/cfr.helper");
const jwt = require('jsonwebtoken');
//Count
const changeIdTo_id = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        phone: Number(data?.phone),
        attempt: Number(data?.attempt),
        password_created: Number(data?.password_created),
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
//
async function qaVerify(req, res, next) {
    const authCfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        user_name: 'N/A',
        email: 'N/A',
        module: 'Authentication',
        description: `Invalid qa attempt for key ${req.body.key}.`,
        method: 'POST',
        role: 'N/A',
        updated_at: (0, dayjs_1.default)().valueOf(),
        activity: 'Invalid QA key',
        notify: false,
    };
    try {
        if (req.body.key === process.env.QA_KEY) {
            res.status(200).json({
                status: '200',
                message: 'Verification successful',
            });
        }
        else {
            // await cfrCreateHelper({
            //   data: authCfrData,
            // });
            res.status(401).json({
                status: '401',
                message: 'Please try again with valid key.',
            });
        }
    }
    catch (error) {
        next(error);
    }
}
exports.qaVerify = qaVerify;
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
        if (req.body.email === process.env.SUPER_ADMIN_USERNAME && req.body.password === process.env.SUPER_ADMIN_PASSWORD) {
            const token0 = jwt.sign({
                // Include relevant user details in response if needed
                username: process.env.SUPER_ADMIN_USERNAME,
                email: process.env.SUPER_ADMIN_USERNAME,
                role: 'admin',
                fname: process.env.SUPER_ADMIN_USERNAME,
                lname: process.env.SUPER_ADMIN_USERNAME,
                phone: '',
                avatar: '',
                attempt: 0,
                password: process.env.SUPER_ADMIN_PASSWORD,
                _id: 'super-admin',
            }, process.env.JWT_SECRET);
            res.status(200).json({
                status: '200',
                message: 'Login successful',
                user: {
                    // Include relevant user details in response if needed
                    username: process.env.SUPER_ADMIN_USERNAME,
                    email: process.env.SUPER_ADMIN_USERNAME,
                    role: 'admin',
                    fname: process.env.SUPER_ADMIN_USERNAME,
                    lname: process.env.SUPER_ADMIN_USERNAME,
                    phone: '',
                    avatar: '',
                    attempt: 0,
                    password: process.env.SUPER_ADMIN_PASSWORD,
                    _id: 'super-admin',
                    isSuperAdmin: true,
                },
                token: token0,
            });
        }
        else {
            if (process.env.AUTH_TYPE !== 'ldap') {
                const userRes = await prisma_1.prisma.user.findUnique({
                    where: {
                        email: req.body.email,
                    },
                });
                if (!userRes) {
                    res.status(401).json({
                        status: '401',
                        message: 'Please ask your admin for CMS access.',
                    });
                }
                const user = changeIdTo_id(userRes);
                if (!user) {
                    res.status(401).json({
                        status: '401',
                        message: 'Please ask your admin for CMS access.',
                        user: user,
                    });
                }
                const token1 = jwt.sign({
                    // Include relevant user details in response if needed
                    username: user?.username,
                    email: user?.email,
                    role: user?.role,
                    fname: user?.fname,
                    lname: user?.lname,
                    phone: user?.phone,
                    // avatar: user?.avatar,
                    attempt: user?.attempt,
                    qnn: user?.qnn,
                    // signature: user?.signature,
                    _id: user?._id,
                }, process.env.JWT_SECRET);
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
                    token: token1,
                });
            }
            if (process.env.AUTH_TYPE === 'ldap') {
                (0, ldap_1.default)(req.body.email, req.body.password)
                    .then(async (ldapResponse) => {
                    // Check wheather the user is existing in Users collection.
                    const userRes = await prisma_1.prisma.user.findUnique({
                        where: {
                            email: req.body.email,
                        },
                    });
                    const user = changeIdTo_id(userRes);
                    if (!user) {
                        try {
                            await (0, cfr_helper_1.cfrCreateHelper)({
                                data: authCfrData,
                            });
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
                            await (0, cfr_helper_1.cfrCreateHelper)({
                                data: authCfrData,
                            });
                        }
                        catch (error) {
                        }
                        return res.status(401).json({
                            message: 'Your account is locked. Please contact admin.',
                        });
                    }
                    const token2 = jwt.sign({
                        // Include relevant user details in response if needed
                        username: user?.username,
                        email: user?.email,
                        role: user?.role,
                        fname: user?.fname,
                        lname: user?.lname,
                        phone: user?.phone,
                        // avatar: user?.avatar,
                        attempt: user?.attempt,
                        qnn: user?.qnn,
                        // signature: user?.signature,
                        _id: user?._id,
                    }, process.env.JWT_SECRET);
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
                        token: token2,
                    });
                })
                    .catch(async (err) => {
                    if (err && err.email) {
                        const userRes2 = await prisma_1.prisma.user.findUnique({
                            where: {
                                email: err.email,
                            },
                        });
                        if (!userRes2) {
                            try {
                                await (0, cfr_helper_1.cfrCreateHelper)({
                                    data: authCfrData,
                                });
                            }
                            catch (error) {
                            }
                            return res.status(401).json({
                                status: '401',
                                message: `${err.message}, Please ask your admin for CMS access.`,
                            });
                        }
                        const userRes = await prisma_1.prisma.user.update({
                            where: {
                                email: err.email,
                            },
                            data: {
                                attempt: {
                                    increment: 1,
                                },
                            },
                        });
                        const user = changeIdTo_id(userRes);
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
                                await (0, cfr_helper_1.cfrCreateHelper)({
                                    data: authCfrData,
                                });
                            }
                            catch (error) {
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
                            await (0, cfr_helper_1.cfrCreateHelper)({
                                data: authCfrData,
                            });
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
        const dbusers = await prisma_1.prisma.user.findMany();
        const availableUsers = users.filter((user) => {
            const isInDB = dbusers.find((dbu) => dbu.email === user.mail || dbu.email === user.cn);
            return !isInDB;
        });
        const usersWithEmail = availableUsers
            .filter((user) => {
            return (user.mail && user.mail !== null) || (user.cn && user.cn !== null);
        })
            .map((user) => {
            const userWithEmail = {
                ...user,
                // email: `${CN}@${DC1}.${DC2}`
                email: user.mail || user.cn,
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
    if (req.body.email === process.env.SUPER_ADMIN_USERNAME && req.body.password === process.env.SUPER_ADMIN_PASSWORD) {
        const token0 = jwt.sign({
            // Include relevant user details in response if needed
            username: process.env.SUPER_ADMIN_USERNAME,
            email: process.env.SUPER_ADMIN_USERNAME,
            role: 'admin',
            fname: process.env.SUPER_ADMIN_USERNAME,
            lname: process.env.SUPER_ADMIN_USERNAME,
            phone: '',
            // avatar: '',
            attempt: 0,
            password: process.env.SUPER_ADMIN_PASSWORD,
            _id: 'super-admin',
        }, process.env.JWT_SECRET);
        res.status(200).json({
            status: '200',
            message: 'Login successful',
            user: {
                // Include relevant user details in response if needed
                username: process.env.SUPER_ADMIN_USERNAME,
                email: process.env.SUPER_ADMIN_USERNAME,
                role: 'admin',
                fname: process.env.SUPER_ADMIN_USERNAME,
                lname: process.env.SUPER_ADMIN_USERNAME,
                phone: '',
                avatar: '',
                attempt: 0,
                password: process.env.SUPER_ADMIN_PASSWORD,
                _id: 'super-admin',
                isSuperAdmin: true,
            },
            token: token0,
        });
    }
    else {
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
            const userRes = await prisma_1.prisma.user.findUnique({
                where: {
                    email: req.body.email,
                },
            });
            if (!userRes) {
                try {
                    await (0, cfr_helper_1.cfrCreateHelper)({
                        data: authCfrData,
                    });
                }
                catch (error) {
                }
                return res.status(401).json({
                    status: '401',
                    message: 'Please ask your admin for CMS access.',
                });
            }
            const user = changeIdTo_id(userRes);
            if (user.attempt && user.attempt >= LoginLockAttempts) {
                authCfrData.user_name = user.username;
                authCfrData.email = user.email;
                authCfrData.role = user.role;
                authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is locked.`;
                try {
                    await (0, cfr_helper_1.cfrCreateHelper)({
                        data: authCfrData,
                    });
                }
                catch (error) {
                }
                return res.status(401).json({
                    message: 'Your account is locked. Please contact admin.',
                });
            }
            const token1 = jwt.sign({
                // Include relevant user details in response if needed
                username: user?.username,
                email: user?.email,
                role: user?.role,
                fname: user?.fname,
                lname: user?.lname,
                phone: user?.phone,
                // avatar: user?.avatar,
                attempt: user?.attempt,
                qnn: user?.qnn,
                // signature: user?.signature,
                _id: user?._id,
            }, process.env.JWT_SECRET);
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
                token: token1,
            });
        })
            .catch(async (err) => {
            if (err && err.email) {
                let userRes = null;
                try {
                    userRes = await prisma_1.prisma.user.update({
                        where: {
                            email: err.email,
                        },
                        data: {
                            attempt: {
                                increment: 1,
                            },
                        },
                    });
                }
                catch (error) {
                    return res.status(401).json(err);
                }
                if (!userRes) {
                    return res.status(401).json(err);
                }
                const user = changeIdTo_id(userRes);
                if (user && user) {
                    authCfrData.user_name = user?.username ?? '';
                    authCfrData.email = user?.email;
                    authCfrData.role = user?.role;
                    if (user.attempt && user.attempt === LoginLockAttempts) {
                        authCfrData.description = `Invalid login attempt for email ${req.body.email} : Exceeded maximum number of failed login attempts.`;
                    }
                    else if (user.attempt && user.attempt > LoginLockAttempts) {
                        authCfrData.description = `Invalid login attempt for email ${req.body.email} : Account is Locked.`;
                    }
                    try {
                        await (0, cfr_helper_1.cfrCreateHelper)({
                            data: authCfrData,
                        });
                    }
                    catch (error) {
                    }
                }
                if (user && user?.attempt && user.attempt === LoginLockAttempts)
                    return res.status(401).json({
                        message: 'Your account has been locked.',
                    });
                if (user && user?.attempt && user.attempt > LoginLockAttempts)
                    return res.status(401).json({
                        message: 'Your account is locked. Please contact admin.',
                    });
            }
            try {
                await (0, cfr_helper_1.cfrCreateHelper)({
                    data: authCfrData,
                });
            }
            catch (error) {
            }
            res.status(401).json(err);
        });
    }
}
exports.findOneLdap = findOneLdap;
//# sourceMappingURL=auth.handlers.js.map