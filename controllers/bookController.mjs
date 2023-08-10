import Book from './../models/book.mjs';
import {catchAsync} from './../utils/catchAsync.mjs';
import {AppError} from './../utils/appError.mjs';
import QueryFeatures from '../utils/queryFeatuers.mjs';
import createPaginationObject from '../utils/createPaginationObject.mjs';
import multer from 'multer';
import sharp from 'sharp';

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/book-covers');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `cover-${req.params.id}.${extension}`);
//   }
// });
const multerStorage = multer.memoryStorage();
const multerFilter = multer.filter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const bookController = {};

bookController.getAllBooks = catchAsync(async function(req, res, next) {
  const features = new QueryFeatures(Book.find(), req.query);

  await features.filter(['title', 'isbn']).sort().limitFields().paginate();

  const total = features.total;
  const books = await features.query;

  if (!req.query.page && !req.query.limit) {
    res.status(200).json({
      status: 'success',
      data: {
        books
      }
    });
    return;
  }

  const pagination = createPaginationObject(Number(req.query.page), Number(req.query.limit), total, books.length);
  res.status(200).json({
    status: 'success',
    data: {
      books,
      pagination
    }
  });
});

bookController.getSingleBook = catchAsync(async function(req, res, next) {
  const id = req.params.id;
  const book = await Book.findById(id);
  if (!book)
    return next(new AppError('Book with specified ID not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

bookController.createBook = catchAsync(async function(req, res, next) {
  const book = await Book.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      book
    }
  });
});

bookController.uploadBookCover = upload.single('bookCoverPhoto');

bookController.processBookCover = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `cover-${req.params.id}.jpeg`;

  sharp(req.file.buffer)
    .toFormat('jpeg')
    .resize(195, 315, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({quality: 90})
    .toFile(`public/img/book-covers/${req.file.filename}`);
  next();
};

bookController.updateBook = catchAsync(async function(req, res, next) {
  const id = req.params.id;

  if (req.file) req.body.bookCoverPhoto = req.file.filename;

  const book = await Book.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true
  });
  if (!book)
    return next(new AppError('Book with specified ID not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

bookController.deleteBook = catchAsync(async function(req, res, next) {
  const {id} = req.params;
  const book = await Book.findByIdAndDelete(id);
  if (!book)
    return next(new AppError('Book with specified ID not found', 404));

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export default bookController;
