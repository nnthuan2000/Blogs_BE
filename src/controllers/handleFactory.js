const { Op } = require('sequelize');
const { sequelize } = require('../models');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

const getPagingData = (data, offset, limit) => {
    const { count: totalDocs, rows: docs } = data;
    const currentPage = offset ? +offset : 0;
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, docs, totalPages, currentPage };
};

const createConditions = (query, ...excludeFields) => {
    const queryConditions = Object.keys(query).reduce(
        (conditions, param) => {
            if (param === 'sort') {
                conditions.order = [query[param].split(',')];
            } else if (param === 'limit') {
                conditions.limit = parseInt(query[param], 10);
            } else if (param === 'offset') {
                conditions.offset = parseInt(query[param], 10);
            } else if (param === 'fields') {
                conditions.attributes = [...query[param].split(',')];
            } else {
                const value = query[param];

                if (typeof value === 'object') {
                    const [operator] = Object.keys(value);
                    const v = value[operator];
                    conditions.where[param] = { [Op[operator]]: v };
                } else {
                    conditions.where[param] = value;
                }
            }
            return conditions;
        },
        { where: {} }
    );

    queryConditions.exclude = [...excludeFields];
    return queryConditions;
};

exports.getAll = (Model, ...excludeFields) =>
    catchAsyncError(async (req, res, next) => {
        const { offset, limit } = req.query;
        const result = await sequelize.transaction(async (t) => {
            const queryConditions = createConditions(req.query, ...excludeFields);
            console.log(queryConditions);
            const docs = await Model.findAndCountAll({
                ...queryConditions,
                transaction: t,
            });
            return getPagingData(docs, offset, limit);
        });
        res.status(200).json({
            status: 'success',
            data: result,
        });
    });

exports.createOne = (Model) =>
    catchAsyncError(async (req, res, next) => {
        const doc = await sequelize.transaction((t) => Model.create(req.body, { transaction: t }));
        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, ...excludeFields) =>
    catchAsyncError(async (req, res, next) => {
        const doc = await sequelize.transaction((t) =>
            Model.findByPk(req.params.id, {
                exclude: [...excludeFields],
                transaction: t,
            })
        );

        if (!doc) return next(new AppError('No document found with that ID', 404));

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.updateOne = (Model, ...excludeFields) =>
    catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        if ('active' in Object.keys(req.body)) {
            return next(new AppError(`Can't update that field`, 400));
        }
        const result = await sequelize.transaction(async (t) => {
            const [numUpdated] = await Model.update(req.body, {
                where: { id: id, active: true },
                transaction: t,
            });
            if (numUpdated === 0) throw new AppError('No document found with that ID', 404);
            return await Model.findByPk(id, {
                exclude: ['active', ...excludeFields],
                transaction: t,
            });
        });
        res.status(200).json({
            status: 'success',
            data: result,
        });
    });

exports.deleteOne = (Model) =>
    catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        await sequelize.transaction(async (t) => {
            const [numUpdated] = await Model.update(
                { active: false },
                { where: { id: id, active: true }, transaction: t }
            );
            if (numUpdated === 0) throw new AppError('No document found with that ID', 404);
        });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
