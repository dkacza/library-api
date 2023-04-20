import jwt from 'jsonwebtoken';

import User from './../models/user.mjs';

import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from '../utils/appError.mjs';
import {filterObject} from '../utils/filterObject.mjs';

const authController = {};

authController.signUp = catchAsync(async function (req, res, next) {
    const acceptedFields = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'password',
    ];
    const filteredBody = filterObject(req.body, ...acceptedFields);

    const newUser = await User.create(filteredBody);
    createAndSignToken(newUser, 201, res);
});

authController.login = catchAsync(async function (req, res, next) {
    // Check if user passed the email and the password
    const {email, password} = req.body;
    if (!email || !password)
        return next(
            new AppError('Email or password have not been passed', 400)
        );

    // Check if user password and email are correct
    const user = await User.findOne({email}).select('+password');
    const checkPassword = await user.correctPassword(password, user.password);
    if (!user || !checkPassword)
        return next(new AppError('Wrong email or password', 401));

    createAndSignToken(user, 200, res);
});

const createAndSignToken = function (user, statusCode, res) {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ), // Cookie expiration date
        httpOnly: true, // Cookie can only be accessed with HTTP.
    };
    user.password = undefined;
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        data: {user},
    });
};
const signToken = function (id) {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export default authController;
