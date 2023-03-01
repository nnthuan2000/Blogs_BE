const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
    const Blog = sequelize.define('Blog', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'Blog must have title',
                },
                notEmpty: {
                    msg: "Title of blog can't be emptied",
                },
            },
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'A blog must have a author',
                },
            },
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'A blog must have summary',
                },
                notEmpty: {
                    msg: "Summary of blog can't be emptied",
                },
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'A blog must have content',
                },
                notEmpty: {
                    msg: "Content of blog can't be emptied",
                },
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        level: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['beginner', 'intermediate', 'advanced'],
            validate: {
                notNull: {
                    msg: 'A blog must have a level',
                },
                isIn: {
                    args: [['beginner', 'intermediate', 'advanced']],
                    msg: 'level must be one of these: beginner, intermediate, advanced',
                },
            },
        },
        rate: {
            type: DataTypes.FLOAT,
            defaultValue: 4,
            validate: {
                isFloat: true,
                max: 5,
                min: 1,
            },
        },
        topic: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'A blog must have topic',
                },
            },
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    Blog.beforeFind((options) => {
        options.where = {
            ...options.where,
            active: { [Op.is]: true },
        };
        if (options.attributes) {
            options.attributes.exclude = ['active'];
        } else options.attributes = { exclude: ['active'] };
    });

    Blog.afterSave((blog, _) => {
        blog.active = undefined;
    });

    return Blog;
};
