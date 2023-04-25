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

// Admin-only
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

export default router;
