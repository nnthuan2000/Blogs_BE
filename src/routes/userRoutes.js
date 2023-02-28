const express = require('express');

const authController = require('../controllers/authControllers');
const userController = require('../controllers/userController');

const authRoutes = require('./authRoutes');

const router = express.Router();

router.use(authRoutes);

router.route('/').get(userController.getAllUsers);

module.exports = router;
