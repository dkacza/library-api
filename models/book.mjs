import mongoose from 'mongoose';
import Author from './author.mjs';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: [100, 'Title must be shorter than 50 characters']
  },
  authors: {
    type: [Author.schema],
    required: [true, 'Book must have at least one author'],
    validate: {
      validator: val => {
        if (!Array.isArray(val)) return false;
        if (val.length < 1) return false;
      },
      message: 'Book must have at least one author'
    }
  },
  publicationDate: {
    type: Date,
    validate: {
      validator: val => val < Date.now(),
      message: 'Book has to be already published'
    }
  },
  isbn: {
    required: true,
    type: String
  },
  description: {
    type: String
  },
  genre: {
    type: String,
    enum: ['fiction', 'nonFiction', 'poetry', 'scientific', 'children'],
    required: [
      true,
      'Book must have a genre (fiction, nonFiction, poetry, scientific, children)'
    ]
  },
  bookCoverPhoto: {
    type: String,
    default: 'default.jpeg'
  },
  currentStatus: {
    type: String,
    enum: ['available', 'borrowed', 'lost'],
    default: 'available'
  },
  __v: {
    type: Number,
    select: false
  }
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
