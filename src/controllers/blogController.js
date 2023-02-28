const { Op } = require('sequelize');

const { Blog, sequelize } = require('../models');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const createConditions = require('../utils/createConditions');

const getPagingData = (data, offset, limit) => {
    const { count: totalBlogs, rows: blogs } = data;
    const currentPage = offset ? +offset : 0;
    const totalPages = Math.ceil(totalBlogs / limit);
    return { totalBlogs, blogs, totalPages, currentPage };
};

exports.getPagination = (req, res, next) => {
    const { size: limit = 3, page: offset = 0 } = req.query;
    req.query.limit = limit;
    req.query.offset = offset * limit;
    delete req.query.size;
    delete req.query.page;

    next();
};

exports.getAllBlogs = catchAsyncError(async (req, res, next) => {
    const { offset, limit } = req.query;
    const result = await sequelize.transaction(async (t) => {
        const queryConditions = createConditions(req.query);
        const blogs = await Blog.findAndCountAll(queryConditions, { transaction: t });
        return getPagingData(blogs, offset, limit);
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

exports.createBlog = catchAsyncError(async (req, res, next) => {
    const result = await sequelize.transaction(async (t) => {
        const blog = await Blog.create(req.body, { transaction: t });
        return blog;
    });

    res.status(201).json({
        status: 'success',
        data: result,
    });
});

exports.deleteAllBlogs = catchAsyncError(async (req, res, next) => {
    await sequelize.transaction(async (t) => {
        await Blog.update({ active: false }, { where: {}, transaction: t });
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getBlog = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const result = await sequelize.transaction(async (t) => {
        const blog = await Blog.findByPk(id, { transaction: t });

        if (!blog) throw new AppError(`Can't find blog with id = ${id}`, 404);
        return blog;
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

exports.updateBlog = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const result = await sequelize.transaction(async (t) => {
        const [numUpdated] = await Blog.update(req.body, {
            where: { id: id, active: { [Op.is]: true } },
            transaction: t,
        });
        if (numUpdated === 0) throw new AppError(`Can't find blog with id = ${id}`, 404);
        const blog = await Blog.findByPk(id, { transaction: t });

        return blog;
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

exports.deleteBlog = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    await sequelize.transaction(async (t) => {
        const [numUpdated] = await Blog.update(
            { active: false },
            { where: { id: id }, transaction: t }
        );
        if (numUpdated === 0)
            throw new AppError(`Can't find blog with id = ${id} or maybe already deleted`, 404);
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
