import nodemailer from 'nodemailer';
import {catchAsync} from './catchAsync.mjs';

export const sendEmail = catchAsync(async function (options) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: 'Library <library@library.com>',
        to: options.receiver,
        subject: options.subject,
        text: options.text,
    };
    await transporter.sendMail(mailOptions);
});
