import Book from './../models/book.mjs';
import {catchAsync} from './../utils/catchAsync.mjs';
import {AppError} from './../utils/appError.mjs';
import QueryFeatures from '../utils/queryFeatuers.mjs';

const bookController = {};

bookController.getAllBooks = catchAsync(async function (req, res, next) {
    const features = new QueryFeatures(Book.find(), req.query);
    features.filter().sort().limitFields().paginate();

    const books = await features.query;

    res.status(200).json({
        status: 'success',
        data: {
            books,
        },
    });
});

bookController.getSingleBook = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (!book)
        return next(new AppError('Book with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            book,
        },
    });
});

bookController.createBook = catchAsync(async function (req, res, next) {
    const book = await Book.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            book,
        },
    });
});

bookController.updateBook = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const book = await Book.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true,
    });
    if (!book)
        return next(new AppError('Book with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            book,
        },
    });
});

bookController.deleteBook = catchAsync(async function (req, res, next) {
    const {id} = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book)
        return next(new AppError('Book with specified ID not found', 404));

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

export default bookController;
