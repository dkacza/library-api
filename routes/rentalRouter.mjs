import express from 'express';

import rentalController from './../controllers/rentalController.mjs';
import authController from './../controllers/authController.mjs';

const router = express.Router();

router.use(authController.checkToken);
router.use(authController.restrictTo('librarian', 'admin'));

router
  .route('/')
  .get(rentalController.getAllRentals)
  .post(rentalController.createRental);

router
  .route('/:id')
  .get(rentalController.getRental)
  .patch(rentalController.updateRental)
  .delete(authController.restrictTo('admin'), rentalController.deleteRental);

export default router;
