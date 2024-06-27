"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLDAPUsersfromConfig = exports.getLDAPUsers = void 0;
//import { authenticate } from 'ldap-authentication';
const ActiveDirectory = require('activedirectory2');
const config = { url: 'ldap://arizonsystems.com/',
    baseDN: 'DC=arizonsystems,DC=com',
    username: 'Administrator@arizonsystems.com',
    password: 'Arizon@123' };
//var ad = new ActiveDirectory(config);
const ad = new ActiveDirectory(config);
async function loginLDAP(username, password) {
    return new Promise((resolve, reject) => {
        ad.authenticate(username, password, function (err, auth) {
            if (err) {
                reject({
                    message: 'Incorrect email or password. Please check your credentials and try again.',
                    email: username,
                });
            }
            if (auth) {
                resolve('Authenticated!');
            }
            else {
                reject({
                    message: 'Authentication failed',
                    email: username,
                });
            }
        });
    });
}
exports.default = loginLDAP;
async function getLDAPUsers() {
    return new Promise((resolve, reject) => {
        ad.findUsers((err, users) => {
            if (err) {
                console.error('Error retrieving users:', err);
                reject(err); // Reject the promise if there's an error
            }
            else {
                resolve(users); // Resolve the promise with the retrieved users
            }
        });
    });
}
exports.getLDAPUsers = getLDAPUsers;
async function getLDAPUsersfromConfig(config) {
    const privAD = new ActiveDirectory(config);
    return new Promise((resolve, reject) => {
        privAD.findUsers((err, users) => {
            if (err) {
                console.error('Error retrieving users:', err);
                reject(err); // Reject the promise if there's an error
            }
            else {
                resolve(users); // Resolve the promise with the retrieved users
            }
        });
    });
}
exports.getLDAPUsersfromConfig = getLDAPUsersfromConfig;
//# sourceMappingURL=ldap.js.map