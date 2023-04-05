import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    book: {
        // REFERENCE TO THE BOOK
    },
    user: {
        // REFERENCE TO THE USER
    },
    startDate: {

    },
    endDate: {

    },
    expirationDate: {

    },
    currentStatus: {

    },
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;