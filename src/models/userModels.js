const bcrypt = require('bcryptjs');
const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            trim: true,
            validate: {
                notNull: {
                    msg: 'User must have a name',
                },
                notEmpty: true,
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            trim: true,
            validate: {
                notNull: {
                    msg: 'User must have a email',
                },
                isEmail: {
                    msg: 'Incorrect email format',
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'User must have a password',
                },
                is: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            },
        },
        passwordConfirm: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                isSamePassword(value) {
                    if (value !== this.password) {
                        throw new Error('Passwords are not the same!');
                    }
                },
            },
        },
        job: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notNull: {
                    msg: 'User must have a job',
                },
            },
        },
        role: {
            type: DataTypes.ENUM,
            values: ['user', 'admin', 'moderator'],
            defaultValue: 'user',
            trim: true,
            validate: {
                isIn: {
                    args: [['user', 'admin', 'moderator']],
                    msg: 'A role is either: user, moderator or admin ',
                },
            },
        },
        photo: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    User.beforeSave(async (user, _) => {
        user.dataValues.password = await bcrypt.hash(user.dataValues.password, 12);
        user.dataValues.passwordConfirm = undefined;
    });

    User.afterSave((user, _) => {
        user.dataValues.active = undefined;
        user.dataValues.password = undefined;
    });

    User.beforeFind((options) => {
        options.where = {
            ...options.where,
            active: { [Op.is]: true },
        };
        if (options.attributes) {
            options.attributes.exclude = ['active'];
        } else options.attributes = { exclude: ['active'] };
    });

    User.prototype.isCorrectPassword = async (passwordFromClient, passwordFromDB) =>
        await bcrypt.compare(passwordFromClient, passwordFromDB);

    return User;
};
