import express from 'express';

import bookController from '../controllers/bookController.mjs';

const router = express.Router();
router
    .route('/')
    .get(bookController.getAllBooks)
    .post(bookController.createBook);
router
    .route('/:id')
    .get(bookController.getSingleBook)
    .patch(bookController.updateBook)
    .delete(bookController.deleteBook);

export default router;
