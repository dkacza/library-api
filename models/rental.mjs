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
        required: [true, 'User ID is required in rental object']
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
    },
    currentStatus: {
        type: String,
        enum: ['returned', 'lost', 'borrowed'],
        default: 'borrowed',
    },
});

rentalSchema.plugin(referrenceValidator);

rentalSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName'
    });
    this.populate({
        path: 'book',
        select: 'title',
    })
    next();
})

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;