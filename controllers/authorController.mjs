import Author from './../models/author.mjs';
import { catchAsync } from './../utils/catchAsync.mjs';
import { AppError } from './../utils/appError.mjs';


const authorController = {};

authorController.getAllAuthors = catchAsync(async function (req, res, next) {
    const authors = await Author.find();

    res.status(200).json({
        status: 'success',
        data: {
            authors
        }
    });
});
authorController.getAuthor = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const author = await Author.findById(id);
    if(!author)  return next(new AppError('Author with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            author
        }
    })
});

authorController.createAuthor = catchAsync(async function (req, res, next) {
    const author = await Author.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            author
        }
    });
});

authorController.updateAuthor = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const author = await Author.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if(!author)  return next(new AppError('Author with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            author
        }
    })
});

authorController.deleteAuthor = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const author = await Author.findByIdAndDelete(id);
    if(!author)  return next(new AppError('Author with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {}
    })
});

export default authorController;