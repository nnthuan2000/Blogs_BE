const { User, sequelize } = require('../models');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const tokenHandler = require('../utils/tokenHandler');

const createSendToken = catchAsyncError(async (data, statusCode, res) => {
    const { id, username } = data;
    const accessToken = await tokenHandler.generateToken({ id, username }, 'access');
    const refreshToken = await tokenHandler.generateToken({ id, username }, 'refresh');

    res.status(statusCode).json({
        status: 'success',
        data: { data },
        accessToken,
        refreshToken,
    });
});

exports.signup = catchAsyncError(async (req, res, next) => {
    const result = await sequelize.transaction((t) => User.create(req.body, { transaction: t }));
    createSendToken(result, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await sequelize.transaction(async (t) => {
        //? 1. Check if user exist && password is correct
        const user = await User.findOne({ where: { email: email } }, { transaction: t });
        user.isCorrectPassword(user.name);
    });

    //? 2. If everything oke, sent token to client
    res.status(200).json({
        status: 'success',
        data: { result },
    });
});
