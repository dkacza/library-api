// NPM packages
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Modules
import bookRouter from './routes/bookRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import authorRouter from './routes/authorRouter.mjs';
import { errorController } from './controllers/errorController.mjs';

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception\nExiting...');
    console.log(err);
    process.exit(1);
})

dotenv.config({ path: './config.env' });

// Establishing DB connection:
mongoose.connect(process.env.DB, {})
    .then(() => console.log('Database connection established'))
    .catch(() => {
        console.log('Could not establish database connection\nExiting...');
        process.exit(1);
    });


const app = express();

// Middleware stack
// Logging Requests to the console
app.use(morgan('tiny'));
// Reading parameters from request body
app.use(express.json())

// Monting routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/authors', authorRouter);

// Global error handling
app.use(errorController);

const port = Number(process.env.PORT);
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection\nExiting...');
    console.log(err);
    process.exit(1);
})