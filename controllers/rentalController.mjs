import { catchAsync } from "../utils/catchAsync.mjs";
import Rental from './../models/rental.mjs';

const rentalController = {};

rentalController.getAllRentals = catchAsync(async function (req, res, next) {
    const rentals = await Rental.find();

    res.status(200).json({
        'status': 'success',
        data: {
            rentals
        }
    })
});
rentalController.getRental = catchAsync(async function (req, res, next) {
    const { id } = req.params;
    const rental = await Rental.findById(id);
    if (!rental) return next(new AppError('Rental with specified ID not found', 404));
    res.status(200).json({
        'status': 'success',
        data: {
            rental
        }
    })
});
rentalController.createRental = catchAsync(async function (req, res, next) {
    const rental = await Rental.create(req.body);
    res.status(201).json({
        'status': 'success',
        data: {
            rental
        }
    })
});
rentalController.updateRental = catchAsync(async function (req, res, next) {
    const { id } = req.params;
    const rental = await Rental.findByIdAndUpdate(id, req.body);
    if (!rental) return next(new AppError('Rental with specified ID not found', 404));
    res.status(200).json({
        'status': 'success',
        data: {
            rental
        }
    })
});
rentalController.deleteRental = catchAsync(async function (req, res, next) {
    const { id } = req.params;
    const rental = await Rental.findByIdAndDelete(id);
    if (!rental) return next(new AppError('Rental with specified ID not found', 404));
    res.status(204).json({
        'status': 'success',
        data: null
    })
});

export default rentalController;