import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, 'Author name must be unique'],
        required: [true, 'Author must have a name'],
        trim: true,
        maxLength: [40, 'Name can not exceed 40 characters'],
    },
    bio: {
        type: String,
    },
    photoPath: {
        type: String,
        validate: {
            validator: val => {
                val.endsWith('.jpg') || val.endsWith('.png');
            },
            message: 'Photo must have a valid format',
        },
        default: 'photos/defaultAuthor.jpg',
    },
    __v: {
        type: Number,
        select: false
    }
});

const Author = mongoose.model('Author', authorSchema);
export default Author;
