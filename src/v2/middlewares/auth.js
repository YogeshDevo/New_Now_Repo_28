"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthIntercept = void 0;
const prisma_1 = require("../../../prisma");
const jwt = require('jsonwebtoken');
const API_DEF = {
    'inc-cal': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'ins-master': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'cal-schedule': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'report': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'ins-request': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'cal-procedure': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'set-points': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'external-report': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'cfr': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'db-backup': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'std-cal-schedule': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'units': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'tolerances': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'ins-dept': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'mutex': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'users': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'auth': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'envdata': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
    'seed': {
        'approver': ['GET', 'POST', 'PUT', 'DELETE'],
        'performer': ['GET', 'POST', 'PUT', 'DELETE'],
        'planner': ['GET', 'POST', 'PUT', 'DELETE'],
        'user': ['GET', 'POST', 'PUT', 'DELETE'],
        'admin': ['GET', 'POST', 'PUT', 'DELETE'],
    },
};
function findModulePermisionForRole(url, role, method) {
    let moduleIdentifierLevelOne;
    let moduleIdentifier;
    if (process.env.NODE_ENV === 'production') {
        moduleIdentifierLevelOne = url.split('/')[1];
        moduleIdentifier = moduleIdentifierLevelOne.split('?')[0];
    }
    else {
        moduleIdentifierLevelOne = url.split('/')[3];
        moduleIdentifier = moduleIdentifierLevelOne.split('?')[0];
    }
    return API_DEF[moduleIdentifier][role].includes(method);
}
async function AuthIntercept(req, res, next) {
    try {
        const moduleSplit = req.url.split('/');
        const module = moduleSplit[moduleSplit.length - 1];
        if (module === 'auth' || module === 'contactadmin' || module === 'metrics' || module === 'json' || req.url.startsWith('/cfr/push')) {
            next();
        }
        else {
            if (req.headers.authorization) {
                const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
                if (!decodedUser || !decodedUser.email) {
                    next(new Error('Request is not authorized'));
                    return;
                }
                let user;
                if (decodedUser && decodedUser.username === process.env.SUPER_ADMIN_USERNAME && decodedUser.password === process.env.SUPER_ADMIN_PASSWORD) {
                    user = decodedUser;
                }
                else {
                    user = user = await prisma_1.prisma.user.findUnique({
                        where: {
                            email: decodedUser.email,
                        },
                    });
                }
                if (!user || !user.email) {
                    next(new Error('Request is not authorized'));
                    return;
                }
                const canPerform = findModulePermisionForRole(req.url, decodedUser.role, req.method);
                if (!canPerform) {
                    next(new Error('User is not authorized to perform this action'));
                    return;
                }
                next();
            }
            else {
                next(new Error('Request is not authorized'));
                return;
            }
        }
    }
    catch (error) {
        next(error);
        return;
    }
}
exports.AuthIntercept = AuthIntercept;
//# sourceMappingURL=auth.js.map