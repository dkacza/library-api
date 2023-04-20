export class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.statusCode = code;
        this.status = String(code).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
