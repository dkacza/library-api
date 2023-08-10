import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from './../utils/appError.mjs';
import {filterObject} from './../utils/filterObject.mjs';

import Rental from './../models/rental.mjs';
import User from './../models/user.mjs';
import Book from './../models/book.mjs';
import rentalAggregation from '../aggregations/rentalAggregation.mjs';
import createPaginationObject from '../utils/createPaginationObject.mjs';


const sendRentalData = async function(req, res, next) {
  const rentalsData = await rentalAggregation(req.query, req.user);

  if (!rentalsData || rentalsData.length === 0) {
    return next(new AppError('Rentals for logged in user with specified filters not found', 404));
  }

  const rentals = rentalsData[0].paginatedResults;
  const total = rentalsData[0].totalCount.count;

  if (!rentals) {
    return next(new AppError('Rentals for logged in user not found', 404));
  }

  if (!req.query.page && !req.query.limit) {
    res.status(200).json({
      status: 'success',
      data: {
        rentals
      }
    });
    return;
  }

  const pagination = createPaginationObject(Number(req.query.page), Number(req.query.limit), total, rentals.length);
  console.log(pagination);
  res.status(200).json({
    status: 'success',
    data: {
      rentals,
      pagination
    }
  });
};

const rentalController = {};

rentalController.getAllRentals = catchAsync(async function(req, res, next) {
  // Requires conversion to aggregation
  await sendRentalData(req, res, next);

});

rentalController.getRental = catchAsync(async function(req, res, next) {
  const {id} = req.params;
  const rental = await Rental.findById(id);
  if (!rental)
    return next(new AppError('Rental with specified ID not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      rental
    }
  });
});

rentalController.createRental = catchAsync(async function(req, res, next) {
  const filteredBody = filterObject(req.body, 'user', 'book');

  // Check if the book is available
  const bookId = filteredBody.book;
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book with specified ID not found', 404));
  }

  if (book.currentStatus !== 'available')
    return next(new AppError('Book is not available', 406));

  // Check if the user is eligible
  const userId = filteredBody.user;
  const user = await User.findById(userId);
  if (!user.eligible)
    return next(
      new AppError(
        'User is not eligible to borrow any more books. Return borrowed ones first',
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
      rental
    }
  });
});

rentalController.updateRental = catchAsync(async function(req, res, next) {
  const filteredBody = filterObject(req.body, 'currentStatus');

  if (filteredBody.currentStatus !== 'returned')
    return next(
      new AppError(
        'This route is dedicated to marking books as returned.\n Use "currentStatus": "returned"',
        405
      )
    );

  // Mark the rental with the correct status
  const {id} = req.params;
  const rental = await Rental.findById(id);
  if (!rental)
    return next(new AppError('Rental with specified ID not found', 404));
  if (rental.currentStatus === 'returned')
    return next(new AppError('This book has been already returned', 405));
  rental.currentStatus = filteredBody.currentStatus;
  rental.returnDate = Date.now();
  rental.save();

  // Mark the book with the correct status
  const bookId = rental.book;
  const book = await Book.findById(bookId);

  const userId = rental.user;
  const user = await User.findById(userId);
  if (book.currentStatus == 'lost') user.eligible('true');

  book.currentStatus = 'available';
  book.save();

  // Remove reference from user rental array
  const result = user.rentals;
  const index = result.indexOf(rental._id);
  result.splice(index, 1);
  user.rentals = result;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      rental
    }
  });
});
rentalController.deleteRental = catchAsync(async function(req, res, next) {
  const {id} = req.params;
  const rental = await Rental.findByIdAndDelete(id);
  if (!rental)
    return next(new AppError('Rental with specified ID not found', 404));

  res.status(204).json({
    status: 'success',
    data: null
  });
});

rentalController.getBookHistory = catchAsync(async function(req, res, next) {
  const bookId = req.params.id;
  const rentals = await Rental.find({book: bookId});
  if (!rentals) {
    return next(new AppError('Rentals for book with specified ID not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: rentals
  });
});

rentalController.getUserHistory = catchAsync(async function(req, res, next) {
  const userId = req.params.id;
  const rentals = await Rental.find({user: userId});
  if (!rentals) {
    return next(new AppError('Rentals for user with specified ID not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: rentals
  });
});

rentalController.getLoggedInUserHistory = catchAsync(async function(req, res, next) {
  // Requires conversion to aggregation
  await sendRentalData(req, res, next);
});

export default rentalController;
