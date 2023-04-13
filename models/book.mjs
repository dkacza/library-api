import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: [50, 'Title must be shorter than 50 characters'],
    },
    authors: {
        // ARRAY OF REFERENCES TO THE AUTHORS
    },
    publicationDate: {
        type: Date,
        validate: {
            validator: val => val < Date.now(),
            message: 'Book has to be already published',
        },
    },
    isbn: {
        required: true,
        type: String,
    },
    description: {
        type: String,
    },
    coverPath: {
        type: String,
        default: '/photos/defaultCover.jpg',
    },
    currentStatus: {
        type: String,
        enum: ['available', 'borrowed', 'notReturned']

    },
    users: {
        // ARRAY OF REFERENCES TO THE USERS WHO BORROWED THE BOOK.
    },
});

const Book = mongoose.model('Book', bookSchema);
export default Book;