"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { authenticate } = require('ldap-authentication');
async function loginLDAP2(username, password) {
    const config = {
        ldapOpts: {
            url: 'ldap://arizonsystems.com/',
            // tlsOptions: { rejectUnauthorized: false }
        },
        adminDn: 'cn=Administrator,dc=arizonsystems,dc=com',
        adminPassword: 'N1$ts=b;YcaJsqr6hc-6GryP($ytVWpr',
        userPassword: 'Test@123',
        userSearchBase: 'dc=arizonsystems,dc=com',
        usernameAttribute: 'uid',
        username: 'approvercms',
        // starttls: false
        groupsSearchBase: 'dc=arizonsystems,dc=com',
        groupClass: 'groupOfUniqueNames',
        groupMemberAttribute: 'uniqueMember',
    };
    const authenticated = await authenticate(config);
    return authenticated;
}
exports.default = loginLDAP2;
//# sourceMappingURL=ldap_backup.js.map