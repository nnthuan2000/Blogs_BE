const { User } = require('../models');
const factory = require('./handleFactory');

exports.getAllUsers = factory.getAll(User, 'password');
exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User, 'password');
exports.updateUser = factory.updateOne(User, 'password');
exports.deleteUser = factory.deleteOne(User);
