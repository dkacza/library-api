import User from '../models/user.mjs';
import { catchAsync } from '../utils/catchAsync.mjs'
import { AppError } from '../utils/appError.mjs';

const userController = {};

userController.getAllUsers = catchAsync(async function (req, res, next) {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
});

userController.getUser = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return next(new AppError('User with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

userController.createUser = catchAsync(async function (req, res, next) {
    const user = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user
        }
    })
});

userController.updateUser = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!user) return next(new AppError('User with specified ID not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

userController.deleteUser = catchAsync(async function (req, res, next) {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id, req.body, { new: true, runValidators: true });
    if (!user) return next(new AppError('User with specified ID not found', 404));

    res.status(204).json({
        status: 'success',
        data: {
            user
        }
    })
})

export default userController;