import express from 'express';

import userController from './../controllers/userController.mjs';
import authController from '../controllers/authController.mjs';
import rentalController from '../controllers/rentalController.mjs';

const router = express.Router();

// Unprotected
router
    .post('/signup', authController.signUp)
    .post('/login', authController.login)
    .get('/logout', authController.logout)
    .post('/forgotPassword', authController.forgotPassword)
    .post('/resetPassword/:token', authController.resetPassword);

// Protected
router.use(authController.checkToken);

router.patch('/changePassword', authController.changePassword);
router.get('/me', userController.getLoggedInUser);
router.patch('/me', userController.updateLoggedInUser);

router.use(authController.restrictTo('librarian', 'admin'));
router
    .route('/')
    .get(userController.getAllUsers)
    .post(authController.restrictTo('admin'), userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.restrictTo('admin'), userController.deleteUser);

router.patch(
    '/promote/:id',
    authController.restrictTo('admin'),
    authController.promoteUser
);
router.get('/:id/history', rentalController.getUserHistory);

export default router;
