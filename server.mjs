import express from 'express';
import dotenv from 'dotenv';

import bookRouter from './routes/bookRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import authorRouter from './routes/authorRouter.mjs'

dotenv.config({path: './config.env'});

const app = express();
const port = Number(process.env.PORT);

// Monting routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/authors', authorRouter);

app.listen(port, () => {
    console.log('Server is running!');
});