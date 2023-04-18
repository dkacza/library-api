import mongoose from 'mongoose';

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
        default: this.startDate + 20,
    },
    currentStatus: {
        type: String,
        enum: ['returned', 'lost', 'borrowed'],
        default: ['borrowed'],
    },
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;