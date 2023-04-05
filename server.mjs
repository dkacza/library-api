// NPM packages
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Modules
import bookRouter from './routes/bookRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import authorRouter from './routes/authorRouter.mjs';

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception. Exiting...');
    console.log(err);
    process.exit(1);
})

dotenv.config({path: './config.env'});

// Establishing DB connection:
console.log(process.env.DB);
mongoose.connect(process.env.DB, {})
    .then(() => console.log('DB connection established.'));


const app = express();

// Middleware stack
app.use(morgan('tiny'));

// Monting routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/authors', authorRouter);

const port = Number(process.env.PORT);
app.listen(port, () => {
    console.log(`Server is running at port ${port}.`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection. Exiting...');
    console.log(err);
    process.exit(1);
})