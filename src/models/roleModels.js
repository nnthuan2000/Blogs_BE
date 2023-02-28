const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
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
    });

    return Role;
};
