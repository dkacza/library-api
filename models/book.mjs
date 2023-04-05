import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {

    },
    author: {
        // EMBEDED AUTHOR ARRAY
    },
    publicationDate: {

    },
    isbn: {

    },
    description: {

    },
    coverPath: {

    },
    currentStatus: {

    },
    users: {
        // ARRAY OF REFERENCES TO THE USERS WHO BORROWED THE BOOK.
    }
});

const Book = mongoose.model('Book', bookSchema);
export default Book;