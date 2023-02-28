const crypto = require('crypto');
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
        passwordResetToken: {
            type: DataTypes.VIRTUAL,
        },
        passwordResetTokenExpires: {
            type: DataTypes.VIRTUAL,
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

    User.prototype.createPasswordResetToken = async function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        // This token is what we're gonna send to the user and so it's like a reset password really that the user can then use to create a new real password. And of course, only the user will have access to this token
        //* => It really behaves kind of like a password, it means that if a hacker can get access to our DB -> that's gonna allow the hacker to gain access of the account by setting a new password
        //! If we would just simply store this reset token in our DB now, then if some attacker gains access to the DB, they could can use that token and create a new password using that token and create a new password using that token instead of you doing it
        //!! ==> Just like a password, we should never store a plain reset token in the database
        this.dataValues.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        this.dataValues.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
        return resetToken;
    };

    return User;
};
