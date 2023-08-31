// NPM packages
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import sanitizer from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';

// Modules
import bookRouter from './routes/bookRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import rentalRouter from './routes/rentalRouter.mjs';
import {errorController} from './controllers/errorController.mjs';
import {refreshStatuses} from './utils/refreshStatuses.mjs';

process.on('uncaughtException', err => {
  console.log('Unhandled Exception\nExiting...');
  console.log(err);
  process.exit(1);
});

dotenv.config({path: './config.env'});

// Establishing DB connection:
let dbConnectionString = process.env.DB_CONNECTION_STRING;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
dbConnectionString = dbConnectionString.replace('<USERNAME>', username).replace('<PASSWORD>', password);
mongoose
  .connect(dbConnectionString, {})
  .then(() => {
    console.log('Database connection established');
    refreshStatuses();
  })
  .catch(() => {
    console.log('Could not establish database connection\nExiting...');
    process.exit(1);
  });

// Rate limiter
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP address.',
});

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_APP_URL,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// Middleware stack
// CORS
app.use(cors(corsOptions));
// Setting HTTP security headers
app.use(helmet());
// Logging Requests to the console
app.use(morgan('tiny'));
// Request limiting for IP addresses
app.use('/api', limiter);
// Reading parameters from request body
app.use(express.json({limit: '10kb'}));
// Sanitize input data
app.use(sanitizer());
// Prevent XSS
app.use(xss());
// Parsing cookies into request object
app.use(cookieParser());
// Serving static files
app.use(express.static(`public`));

// Mounting routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rentals', rentalRouter);

// Global error handling
app.use(errorController);

const port = Number(process.env.PORT);
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

// Refresh statuses every hour
setInterval(refreshStatuses, 60 * 60 * 1000);

process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection\nExiting...');
  console.log(err);
  process.exit(1);
});
