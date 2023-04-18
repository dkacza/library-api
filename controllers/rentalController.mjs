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
    const filteredBody = filterObject(req.body, 'user', 'book');
    // Check if the book is available
    const bookId = filteredBody.book;
    const book = await Book.findById(bookId);
    if (book.currentStatus !== 'available')
        return next(new AppError('Book is not available', 406));

    // Check the user rental array
    const userId = filteredBody.user;
    const user = await User.findById(userId);
    if (user.rentals.length >= 3)
        return next(
            new AppError(
                'User cannot have more than 3 books borrowed at the same time',
                406
            )
        );

    // Create rental, append refference to user, mark book as borrowed
    const rental = await Rental.create(filteredBody);
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
    if (filteredBody.currentStatus !== 'returned')
        return next(
            new AppError(
                'This route is dedicated to marking books as returned.\n Use "currentStatus": "returned"',
                405
            )
        );

    // Mark the book with the correct status
    const {id} = req.params;
    const rental = await Rental.findById(id);
    if (!rental)
        return next(new AppError('Rental with specified ID not found', 404));
    if (rental.currentStatus === 'returned')
        return next(new AppError('This book has been already returned', 405));
    rental.currentStatus = filteredBody.currentStatus;
    rental.save();
    
    // Remove reference from user rental array
    const userId = rental.user;
    const user = await User.findById(userId);

    let find = user.rentals.includes(rental._id);
    console.log(find);
    console.log(user.rentals);

    const result = user.rentals;
    const index = result.indexOf(rental._id);
    result.splice(index, 1);
    console.log(result);

    user.rentals = result;
    await user.save();

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
