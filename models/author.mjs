import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
    name: {

    },
    bio: {

    },
    photoPath: {

    },
});

const Author = mongoose.model('Author', authorSchema);
export default Author;