import express from 'express';

import bookController from '../controllers/bookController.mjs';
import authController from './../controllers/authController.mjs';
import rentalController from '../controllers/rentalController.mjs';

const router = express.Router();

router.use(authController.checkToken);

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(
    authController.restrictTo('librarian', 'admin'),
    bookController.createBook
  );
router
  .route('/:id')
  .get(bookController.getSingleBook)
  .patch(
    authController.restrictTo('librarian', 'admin'),
    bookController.updateBook
  )
  .delete(
    authController.restrictTo('librarian', 'admin'),
    bookController.deleteBook
  );
router.route('/:id/history').get(rentalController.getBookHistory);


export default router;
