import User from './../models/user.mjs';
import Rental from './../models/rental.mjs';
import Book from './../models/book.mjs';
import {catchAsync} from './catchAsync.mjs';

export const refreshStatuses = catchAsync(async function () {
    console.log('Refreshing statuses');

    const rentals = await Rental.find({currentStatus: 'borrowed'});
    for (const rental of rentals) {
        if (Date.now() < rental.expirationDate) continue;
        rental.status = 'lost';

        const userId = rental.user;
        User.findByIdAndUpdate(userId, {eligible: false});

        const bookId = rental.book;
        Book.findByIdAndUpdate(bookId, {currentStatus: 'lost'});

        rental.save();
    }
});
