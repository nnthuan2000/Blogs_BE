const { Blog } = require('../models');
const factory = require('./handleFactory');

exports.getAllBlogs = factory.getAll(Blog, 'active');
exports.createBlog = factory.createOne(Blog);
exports.getBlog = factory.getOne(Blog, 'active');
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
