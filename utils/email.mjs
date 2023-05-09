import nodemailer from 'nodemailer';
import {catchAsync} from './catchAsync.mjs';
import { AppError } from './appError.mjs';

export const sendEmail = catchAsync(async function (options, next) {
    if (!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_HOST && process.env.EMAIL_PORT)) {
        return next(new AppError('Email sending has not been setup on the server side', 500));
    }
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
