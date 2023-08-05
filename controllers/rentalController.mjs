import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from './../utils/appError.mjs';
import {filterObject} from './../utils/filterObject.mjs';

import Rental from './../models/rental.mjs';
import User from './../models/user.mjs';
import Book from './../models/book.mjs';
import QueryFeatures from '../utils/queryFeatuers.mjs';
import isEmptyObject from '../utils/isEmptyObject.mjs';

const rentalController = {};

rentalController.getAllRentals = catchAsync(async function(req, res, next) {
    // Requires conversion to aggregation
    const features = new QueryFeatures(Rental.find(), req.query);
    await features.filter().sort().limitFields().paginate();
    const rentals = await features.query;

    res.status(200).json({
        status: 'success',
        data: {
            rentals
        }
    });
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
    const userId = req.user._id;



    console.log(req.query);

    // Filter by user ID ✔
    // Filter by dates
    // Filter by status
    // Project book title
    // Filter by title

    // Basic query
    const userIdStage = {$match: {user: userId}};
    const joinBooksStage = [
        {
            $lookup: {
                from: 'books',
                localField: 'book',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            isbn: 1
                        }
                    }
                ],
                as: 'bookData'
            }
        },
        {$unwind: '$bookData'}
    ];
    const projectBookFieldsStage = [{
        $set: {
            'title': '$bookData.title',
            'isbn': '$bookData.isbn'
        }
    }, {
        $project: {
            'bookData': 0
        }
    }];

    // Filters and pagination
    let filterByStatus = {};
    if (req.query.currentStatus) {
        filterByStatus = {
            $match: {
                $or: []
            }
        };
        const statuses = req.query.currentStatus.split(',');
        statuses.forEach(status => {
            filterByStatus.$match.$or.push({currentStatus: status});
        });
    }


    let queryString = JSON.stringify(req.query);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(queryString);
    const parsedQuery = JSON.parse(queryString);
    console.log(parsedQuery);

    let filterByStartDate = {};
    if (parsedQuery.startDate ) {
        filterByStartDate = {
            $match: {
                startDate: {}
            }
        };
        filterByStartDate.$match.startDate = (parsedQuery.startDate);
        for (const [key, val] of Object.entries(filterByStartDate.$match.startDate)) {
            filterByStartDate.$match.startDate[key] = new Date(val);
        }
    }

    let filterByReturnDate = {};
    if (parsedQuery.returnDate) {
        filterByReturnDate = {
            $match: {
                returnDate: {}
            }
        }
        filterByReturnDate.$match.returnDate = (parsedQuery.returnDate);
        for (const [key, val] of Object.entries(filterByReturnDate.$match.returnDate)) {
            filterByReturnDate.$match.returnDate[key] = new Date(val);
        }
    }

    let paginate = [];
    if (req.query.page && req.query.limit) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 100;
        const toSkip = (page - 1) * limit;
        paginate.push({
            $facet: {
                paginatedResults: [
                    {$skip: toSkip},
                    {$limit: limit}
                ],
                totalCount: [
                    {$count: 'count'}
                ]
            }
        });
        paginate.push({
            $unwind: {
                path: '$totalCount'
            }
        });
    }

    const aggregationStages = [];
    aggregationStages.push(userIdStage);
    if (!isEmptyObject(filterByStatus)) aggregationStages.push(filterByStatus); // DONE
    // TODO date filter
    if (!isEmptyObject(filterByStartDate)) aggregationStages.push(filterByStartDate);
    if (!isEmptyObject(filterByReturnDate)) aggregationStages.push(filterByReturnDate);

    aggregationStages.push(...joinBooksStage);
    aggregationStages.push(...projectBookFieldsStage);
    aggregationStages.push(...paginate);


    const rentalsData = await Rental.aggregate(aggregationStages);

    console.log(rentalsData);
    if (!rentalsData || rentalsData.length === 0) {
        return next(new AppError('Rentals for logged in user with specified filters not found', 404));
    }

    const rentals = rentalsData[0].paginatedResults;
    const total = rentalsData[0].totalCount.count;

    const limit = Number(req.query.limit);
    const currentPage = Number(req.query.page);

    const totalPages = Math.ceil(total / limit);
    const currentStart = (currentPage - 1) * limit + 1;
    const currentEnd = (currentPage - 1) * limit + rentals.length;

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

    res.status(200).json({
        status: 'success',
        data: {
            rentals,
            pagination: {
                currentPage,
                currentStart,
                currentEnd,
                limit,
                total,
                totalPages
            }
        }
    });
});

export default rentalController;
