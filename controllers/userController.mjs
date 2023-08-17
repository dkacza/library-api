import User from '../models/user.mjs';
import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from '../utils/appError.mjs';
import {excludeProperties} from '../utils/filterObject.mjs';
import QueryFeatures from '../utils/queryFeatuers.mjs';
import createPaginationObject from '../utils/createPaginationObject.mjs';

const userController = {};

userController.getAllUsers = catchAsync(async function(req, res, next) {
  const features = new QueryFeatures(User.find(), req.query);
  await features
    .filter(['firstName', 'lastName', 'email', 'phoneNumber'])
    .sort()
    .limitFields()
    .paginate();

  const total = features.total;
  const users = await features.query;

  if (!req.query.page && !req.query.limit) {
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
    return;
  }
  const pagination = createPaginationObject(Number(req.query.page), Number(req.query.limit), total, users.length);
  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination
    }
  });
});

userController.getUser = catchAsync(async function(req, res, next) {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user)
    return next(new AppError('User with specified ID not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

userController.createUser = catchAsync(async function(req, res, next) {
  const filteredBody = excludeProperties(
    req.body,
    'role',
    'registrationDate',
    'eligible',
    'rentals'
  );
  const user = await User.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      user
    }
  });
});

userController.updateUser = catchAsync(async function(req, res, next) {
  if (req.body.password)
    return next(
      new AppError(
        'This is not a route for changing the password. Use /changePassword instead',
        400
      )
    );
  const filteredBody = excludeProperties(
    req.body,
    'role',
    'registrationDate',
    'eligible',
    'rentals'
  );
  const id = req.params.id;
  const user = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true
  });
  if (!user)
    return next(new AppError('User with specified ID not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

userController.deleteUser = catchAsync(async function(req, res, next) {
  const id = req.params.id;
  const user = await User.findByIdAndDelete(id, req.body, {
    new: true,
    runValidators: true
  });
  if (!user)
    return next(new AppError('User with specified ID not found', 404));

  res.status(204).json({
    status: 'success',
    data: {
      user
    }
  });
});

userController.getLoggedInUser = catchAsync(async function(req, res, next) {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

userController.updateLoggedInUser = catchAsync(async function(req, res, next) {
  if (req.body.password)
    return next(
      new AppError(
        'This is not a route for changing the password. Use /changePassword instead',
        400
      )
    );
  const filteredBody = excludeProperties(
    req.body,
    'role',
    'registrationDate',
    'eligible',
    'rentals'
  );
  const id = req.user.id;
  const user = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export default userController;
