const express = require('express');

const authController = require('../controllers/authControllers');
const userController = require('../controllers/userController');

const authRoutes = require('./authRoutes');

const router = express.Router();

router.use(authRoutes);

//* Protect all routes after this middleware

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)
    .delete(userController.deleteAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
