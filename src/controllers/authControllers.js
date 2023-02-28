const validator = require('validator');

const { User, sequelize } = require('../models');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const tokenHandler = require('../utils/tokenHandler');

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
