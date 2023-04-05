import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {

    },
    lastName: {

    },
    email: {

    },
    password: {

    },
    registrationDate: {

    },
    photoPath: {

    },
    rentals: {
        // ARRAY OF REFERENCES TO RENTALS
    }
});

const User = mongoose.model('User', userSchema);
export default User;