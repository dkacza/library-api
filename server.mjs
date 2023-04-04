// NPM packages
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routers
import bookRouter from './routes/bookRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import authorRouter from './routes/authorRouter.mjs';

dotenv.config({path: './config.env'});

// Establishing DB connection:
mongoose.connect(process.env.DB, {})
    .then(() => console.log('DB connection established.'))
    .catch(() => console.log('DB connection error'));


const app = express();

// Monting routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/authors', authorRouter);

const port = Number(process.env.PORT);
app.listen(port, () => {
    console.log(`Server is running at port ${port}.`);
});
