const { User, sequelize } = require('../models');

const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const result = await sequelize.transaction(async (t) => {
        const users = await User.findAll({}, { transaction: t });
        return users;
    });

    res.status(200).json({
        status: 'success',
        results: result.length,
        data: { result },
    });
});

exports.createUser = catchAsyncError(async (req, res, next) => {});

exports.deleteAllUsers = catchAsyncError(async (req, res, next) => {});

exports.getUser = catchAsyncError(async (req, res, next) => {});

exports.updateUser = catchAsyncError(async (req, res, next) => {});

exports.deleteUser = catchAsyncError(async (req, res, next) => {});
