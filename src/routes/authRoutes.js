const express = require('express');

const authController = require('../controllers/authControllers');

const router = express.Router();

router.route('/auth/signup').post(authController.signup);
router.route('/auth/login').post(authController.login);
router.route('/auth/forgotPassword').post(authController.forgotPassword);
router.route('/auth/resetPassword/:token').post(authController.resetPassword);
router.route('/auth/refreshToken').post(authController.refreshToken);

module.exports = router;
