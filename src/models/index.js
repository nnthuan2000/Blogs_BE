const { Sequelize } = require('sequelize');
const cls = require('cls-hooked');

const dbConfig = require('../configs/dbConfig');

const namespace = cls.createNamespace('blog');
Sequelize.useCLS(namespace);
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorAliases: true,
});

sequelize.beforeConnect(() => {
    console.log(`Connecting with database ${dbConfig.DB}`);
});
sequelize.afterConnect(() => console.log(`Connected with database ${dbConfig.DB}`));

const db = {};
db.sequelize = sequelize;
db.Blog = require('./blogModels')(sequelize);
db.User = require('./userModels')(sequelize);
db.Role = require('./roleModels')(sequelize);

db.User.belongsToMany(db.Role, {
    through: 'user_roles',
    foreignKey: 'userId',
    otherKey: 'roleId',
});

db.Role.belongsToMany(db.User, {
    through: 'user_roles',
    foreignKey: 'roleId',
    otherKey: 'userId',
});

module.exports = db;
