import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'User must have the first name'],
        maxLength: [20, "User's first name must not exceed 20 characters"],
    },
    lastName: {
        type: String,
        required: [true, 'User must have the last name'],
        maxLength: [20, "User's last name must not exceed 20 characters"],
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        validate: {
            validator: val => validator.isEmail(val),
            message: 'Email is incorrect',
        },
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'User must have a phone number'],
        validate: {
            validator: val => validator.isMobilePhone(val),
            message: 'Phone number is incorrect',
        },
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minlength: 8,
        select: false,
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now(),
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
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
        default: './photos/defaultPhoto.jpg',
    },
    rentals: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Rental',
    },
    eligible: {
        // If the user holds a book for too long or has more than 3 books, he is not eligible
        type: Boolean,
        default: true,
    },
    __v: {
        type: Number,
        select: false
    }
});

// Hashing the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000; // -1 second in case JWT signing takes too long
    next();
});

// Eligibility check
userSchema.pre('save', function (next) {
    this.eligible = this.rentals.length < 3;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPasswordChange = function (JWTDate) {
    return JWTDate < this.passwordChangedAt;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
