"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer = require('nodemailer');
const fromMail = 'harish.chellappa@arizonsystems.com';
exports.transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});
console.log('Trying smtp with following credentials', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});
exports.transporter.verify().then((res) => {
}).catch((err) => {
});
async function sendMain(to, subject, body) {
    return await exports.transporter.sendMail({
        from: fromMail,
        to: to,
        subject: subject,
        html: body,
    });
}
exports.default = sendMain;
//# sourceMappingURL=sendMain.js.map