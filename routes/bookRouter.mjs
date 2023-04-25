import express from 'express';

import bookController from '../controllers/bookController.mjs';
import authController from './../controllers/authController.mjs';

const router = express.Router();

router.use(authController.checkToken);

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
