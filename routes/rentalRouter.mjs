import express from 'express';

import rentalController from './../controllers/rentalController.mjs';

const router = express.Router();
router
    .route('/')
    .get(rentalController.getAllRentals)
    .post(rentalController.createRental);

router
    .route('/:id')
    .get(rentalController.getRental)
    .patch(rentalController.updateRental)
    .delete(rentalController.deleteRental);

export default router;
