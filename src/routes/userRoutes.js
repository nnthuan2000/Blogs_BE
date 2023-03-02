const express = require('express');

const authController = require('../controllers/authControllers');
const userController = require('../controllers/userController');

const middlewares = require('../middlewares/getPagination');

const authRoutes = require('./authRoutes');

const router = express.Router();

router.use(authRoutes);

//* Protect all routes after this middleware

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(middlewares.getPagination, userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
