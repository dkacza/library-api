import express from 'express';

import userController from './../controllers/userController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

// Unprotected
router
    .post('/signup', authController.signUp)
    .post('/login', authController.login)
    .get('/logout', authController.logout);

// Protected
router.use(authController.checkToken);

// Librarian
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

export default router;
