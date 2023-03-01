const crypto = require('crypto');
const validator = require('validator');
const { Op } = require('sequelize');

const { User, sequelize } = require('../models');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const tokenHandler = require('../utils/tokenHandler');
const sendEmail = require('../utils/sendEmail');

const createSendToken = async (data, statusCode, res) => {
    const { id, username } = data;
    const accessToken = await tokenHandler.generateToken({ id, username }, 'access');
    const refreshToken = await tokenHandler.generateToken({ id, username }, 'refresh');

    // Remove password from output
    data.dataValues.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: { data },
        accessToken,
        refreshToken,
    });
};

// ! Not in system
exports.signup = catchAsyncError(async (req, res, next) => {
    const result = await sequelize.transaction((t) => User.create(req.body, { transaction: t }));
    createSendToken(result, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //? 1. Check if email and password is not correct format
    if (!validator.isEmail(email)) return next(AppError('Email is not correct format', 400));
    if (
        !validator.matches(
            password,
            /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
        )
    ) {
        return next(AppError('Pasword is not correct format'));
    }

    const result = await sequelize.transaction(async (t) => {
        //? 2. Check if user exist && password is correct
        const user = await User.findOne({ where: { email: email }, transaction: t });
        if (!user) throw new AppError('Incorrect email', 401);
        const isCorrect = await user.isCorrectPassword(password, user.dataValues.password);
        if (!isCorrect) throw new AppError('Incorrect password', 401);
        return user;
    });

    //? 2. If everything oke, sent token to client
    createSendToken(result, 200, res);
});

exports.protect = catchAsyncError(async (req, res, next) => {});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    //? 1. Check if email is correct format
    const { email } = req.body;
    if (!validator.isEmail(email))
        return next(new AppError('Your email is not correct format'), 400);

    await sequelize.transaction(async (t) => {
        //? 2. Get user based on POSTed email
        const user = await User.findOne({ where: { email: email }, transaction: t });
        if (!user) throw new AppError(`There is no user with that email address`, 404);

        //? 3. Generate random token and save it to DB for later checking
        const resetToken = user.createPasswordResetToken();
        await user.save({ validate: false, transaction: t });

        //? 4. Send it to user's email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/user/auth/resetPassword/:${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\n. If you didn't forget your password, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message,
            });
        } catch (error) {
            user.passwordResetToken = null;
            user.passwordResetTokenExpires = null;
            await user.save({ validate: false, transaction: t });
            throw new AppError('There was an error sending the email. Try again later', 500);
        }
    });

    res.status(200).json({
        status: 'success',
        message: 'New token sent to your email!',
    });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    //? 1. Get user based on the token
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const result = await sequelize.transaction(async (t) => {
        let user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpires: { [Op.gte]: Date.now() },
            },
            transaction: t,
        });
        if (!user) throw new AppError('Token is not valid or has expired', 404);

        //? 2. If token has not expired, and there is user, set the new password
        user.password = req.body.password;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        user = await user.save({ validate: true, transaction: t });
        return user;
    });

    //? 3. Log the user in, sent JWT
    // createSendToken(result, 200, res);
    res.status(200).json({
        status: 'success',
        data: { result },
    });
});

// ! Already in system
exports.protect = catchAsyncError(async (req, res, next) => {
    let token;
    //? 1. Get token and check of it's there
    if (req.headers.authorization && req.headers.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token)
        return next(
            new AppError('You are not logged in! Please log in to get access resources', 401)
        );

    //? 2. Verification token
    const decoded = tokenHandler.verifyToken();

    //? 3. Check if user still exist
    //? 4. Check if user changed password after the token was issued
});

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {};
