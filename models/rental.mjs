import mongoose from 'mongoose';
import referrenceValidator from 'mongoose-referrence-validator';

const rentalSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required in rental object'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required in rental object'],
    },
    startDate: {
        type: Date,
        default: Date.now(),
    },
    returnDate: {
        type: Date,
    },
    expirationDate: {
        type: Date,
        default: Date.now() + 1000 * 60 * 60 * 24 * 50, // 50 days from now
    },
    currentStatus: {
        type: String,
        enum: ['returned', 'lost', 'active'],
        default: 'active',
    },
});

rentalSchema.plugin(referrenceValidator);

rentalSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName',
    });
    this.populate({
        path: 'book',
        select: 'title',
    });
    next();
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
