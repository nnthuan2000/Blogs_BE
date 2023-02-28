const express = require('express');

const authController = require('../controllers/authControllers');

const router = express.Router();

router.route('/auth/signup').post(authController.signup);
router.route('/auth/login').post(authController.login);

module.exports = router;
