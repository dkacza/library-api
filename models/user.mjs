import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'User must have the first name'],
        maxLength: [20, 'User\'s first name must not exceed 20 characters']
    },
    lastName: {
        type: String,
        required: [true, 'User must have the last name'],
        maxLength: [20, 'User\'s last name must not exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        validate: {
            validator: (val) => validator.isEmail(val),
            message: 'Email is incorrect'
        }
    },
    phoneNumber: {
        type: String,
        required: [true, 'User must have a phone number'],
        validate: {
            validator: (val) => validator.isMobilePhone(val),
            message: 'Phone number is incorrect',
        }
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minlength: 8,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'librarian', 'admin'],
        default: 'user',
    },
    registrationDate: {
        type: Date,
        default: Date.now(),
    },
    photoPath: {
        type: String,
        default: './photos/defaultPhoto.jpg'
    },
    rentals: {
        // ARRAY OF REFERENCES TO RENTALS
    }
});

// HASHING THE PASSWORD
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

const User = mongoose.model('User', userSchema);
export default User;