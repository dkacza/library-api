import {AppError} from '../utils/appError.mjs';

export const errorController = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.MODE === 'DEV') sendErrorDev(err, res);
    else if (process.env.MODE === 'PRODUCTION') {
        let error = Object.assign({}, err);
        error.name = err.name; // Somehow Object.assign() doesn't cover these keys
        error.message = err.message;
        console.log(err.message);

        if (err.name === 'CastError') error = handleCastError(err);
        if (err.code === 11000) error = handleDuplicateDBFields(err);
        if (err.name == 'validationError') error = handleValidationError(err);
        if (err.name == 'JsonWebToken') error = handleJWTError(err);
        if (err.name == 'TokenExpiredError')
            error = handleExpiredJWTError(err);

        sendErrorProd(error, res);
    }
    next();
};

const handleCastError = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateDBFields = err => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: ${value}. Please use another value. `;
    return new AppError(message, 400);
};
const handleValidationError = err => {
    const errors = Object.values(err.errors).map(err => err.message);
    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);
const handleExpiredJWTError = () =>
    new AppError('Token has expired. Please log in again.', 401);

const sendErrorDev = function (err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = function (err, res) {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
};
