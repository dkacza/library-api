import jwt from 'jsonwebtoken';
import {promisify} from 'util';
import crypto from 'crypto';

import User from './../models/user.mjs';
import {catchAsync} from '../utils/catchAsync.mjs';
import {AppError} from '../utils/appError.mjs';
import {filterObject} from '../utils/filterObject.mjs';
import {sendEmail} from './../utils/email.mjs';

const authController = {};

authController.signUp = catchAsync(async function(req, res, next) {
  const acceptedFields = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'password'
  ];
  const filteredBody = filterObject(req.body, ...acceptedFields);

  const newUser = await User.create(filteredBody);
  createAndSignToken(newUser, 201, res);
});

authController.login = catchAsync(async function(req, res, next) {
  // Check if user passed the email and the password
  const {email, password} = req.body;
  if (!email || !password)
    return next(
      new AppError('Email or password have not been passed', 400)
    );

  // Check if user password and email are correct
  const user = await User.findOne({email}).select('+password');
  if (!user) {
    return next(new AppError('Wrong email or password', 401));
  }
  const checkPassword = await user.correctPassword(password, user.password);
  if (!checkPassword)
    return next(new AppError('Wrong email or password', 401));

  createAndSignToken(user, 200, res);
});

authController.logout = function(req, res, next) {
  res.cookie('jwt', 'LOGGED_OUT', {
    expires: new Date(Date.now() + 1 * 1000), // 1 second from now the JWT will be inactive
    httpOnly: true
  });
  res.status(200).json({status: 'success'});
};

authController.changePassword = catchAsync(async function(req, res, next) {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  // Check if the user provides correct current password
  const userId = req.user._id;
  const currentUser = await User.findById(userId).select('+password');

  const checkPassword = await currentUser.correctPassword(
    currentPassword,
    currentUser.password
  );
  if (!checkPassword)
    return next(new AppError('Current password is wrong', 400));

  currentUser.password = newPassword;
  await currentUser.save({runValidators: true});

  createAndSignToken(currentUser, 200, res);
});

authController.forgotPassword = catchAsync(async function(req, res, next) {
  // 1. Get the user based on email
  const userEmail = req.body.email;
  const currentUser = await User.findOne({email: userEmail});
  if (!currentUser)
    return next(new AppError('User with specified email not found', 400));

  // 2. Create a reset token
  const token = currentUser.createPasswordResetToken();
  currentUser.save();
  // const resetURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${token}`;
  const resetURL = `${process.env.CLIENT_APP_URL}/reset-password/${token}`

  const emailBody = {
    subject: 'Library Password Reset Token (valid for 10 minutes)',
    receiver: userEmail,
    //text: `Submit PATCH request with a new password to the URL: ${resetURL}`
    text: 
    `There was a request for resetting the password made from your account.
    We send you the link to the password reset form.
    ${resetURL}`
  };
  sendEmail(emailBody, next);
  res.status(200).json({
    status: 'success',
    message: 'Email with a link to reset your password has been sent.'
  });
});

authController.resetPassword = catchAsync(async function(req, res, next) {
  // 1. Encrypt the token and compare it with the user one
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const currentUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()}
  });
  if (!currentUser)
    return next(new AppError('Token is wrong or it has expired', 400));

  // 2. Set the new password and password properties
  currentUser.password = req.body.password;
  currentUser.passwordChangedAt = Date.now();
  currentUser.passwordResetToken = undefined;
  currentUser.passwordResetExpires = undefined;
  await currentUser.save();

  // 3. Create and send new JWT
  createAndSignToken(currentUser, 200, res);
});

// Helper functions
const createAndSignToken = function(user, statusCode, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), // Cookie expiration date
    httpOnly: true // Cookie can only be accessed with HTTP.
  };
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    data: {user}
  });
};
const signToken = function(id) {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

authController.checkToken = catchAsync(async function(req, res, next) {
  // 1. Check if the token exists in the request, req.cookies is added by the npm middleware
  const token = req.cookies.jwt;
  if (!token)
    return next(
      new AppError(
        'You must be logged in to get access to that route',
        401
      )
    );
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 2. Check if the user is correct
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        'User, to which this token belongs, does not exist',
        401
      )
    );

  // 3. Check if the token have not expired
  // Multiplying by 1000 is nescessary in order to get correct Date object timestamp
  const issuedAt = new Date(decoded.iat * 1000);
  const expirationDate = new Date(decoded.exp * 1000);

  if (expirationDate < Date.now())
    return next(new AppError('Token has expired', 401));

  // 4. Check if the user have not changed a password after his token was issued
  if (user.checkPasswordChange(issuedAt))
    return next(
      new AppError(
        'User changed his password after JWT was issued. Log in again',
        401
      )
    );

  // 5. Put the user data on the request
  req.user = user;
  next();
});

authController.restrictTo = function(...roles) {
  return async function(req, res, next) {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    next();
  };
};

authController.promoteUser = catchAsync(async function(req, res, next) {
  const userId = req.params.id;
  const currentUser = await User.findById(userId);
  if (!currentUser)
    return next(new AppError('User with specified Id does not exist', 400));

  const newRole = req.body.role;
  if (!newRole)
    return next(new AppError('User must have a role specified', 400));
  currentUser.role = newRole;
  currentUser.save();

  res.status(200).json({
    status: 'success',
    user: currentUser
  });
});
export default authController;
