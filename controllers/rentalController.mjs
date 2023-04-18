import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from './../utils/appError.mjs';
import {filterObject} from './../utils/filterObject.mjs';

import Rental from './../models/rental.mjs';
import User from './../models/user.mjs';
import Book from './../models/book.mjs';

const rentalController = {};

rentalController.getAllRentals = catchAsync(async function (req, res, next) {
    const rentals = await Rental.find();

    res.status(200).json({
        status: 'success',
        data: {
            rentals,
        },
    });
});

rentalController.getRental = catchAsync(async function (req, res, next) {
    const {id} = req.params;
    const rental = await Rental.findById(id);
    if (!rental)
        return next(new AppError('Rental with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            rental,
        },
    });
});

rentalController.createRental = catchAsync(async function (req, res, next) {
    // Check if the book is available
    const bookId = req.body.book;
    const book = await Book.findById(bookId);
    if (book.currentStatus !== 'available')
        return next(new AppError('Book is not available', 406));

    // Check the user rental array
    const userId = req.body.user;
    const user = await User.findById(userId);
    if (user.rentals.length >= 3)
        return next(
            new AppError(
                'User cannot have more than 3 books borrowed at the same time',
                406
            )
        );

    // Create rental, append refference to user, mark book as borrowed
    const rental = await Rental.create(req.body);
    const rentalId = rental._id;
    user.rentals.push(rentalId);
    user.save();
    book.currentStatus = 'borrowed';
    book.save();

    res.status(201).json({
        status: 'success',
        data: {
            rental,
        },
    });
});

rentalController.updateRental = catchAsync(async function (req, res, next) {
    // Filter the request body
    const filteredBody = filterObject(req.body, 'currentStatus');
    if(filteredBody.currentStatus !== 'returned') return next(new AppError('This route is dedicated to marking books as returned.\n Use "currentStatus": "returned"'), 405);

    // Mark the book with the correct status
    const {id} = req.params;
    const rental = await Rental.findByIdAndUpdate(id, filteredBody);
    if (!rental)
        return next(new AppError('Rental with specified ID not found', 404));

    // Remove reference from user rental array
    const userId = rental.user;
    const user = await User.findById(userId);
    user.rentals = user.rentals.filter(id => id !== rental._id);
    user.save();

    res.status(200).json({
        status: 'success',
        data: {
            rental,
        },
    });
});
rentalController.deleteRental = catchAsync(async function (req, res, next) {
    const {id} = req.params;
    const rental = await Rental.findByIdAndDelete(id);
    if (!rental)
        return next(new AppError('Rental with specified ID not found', 404));

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

export default rentalController;
