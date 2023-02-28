const express = require('express');

const blogController = require('../controllers/blogController');

const router = express.Router();

router
    .route('/')
    .get(blogController.getPagination, blogController.getAllBlogs)
    .post(blogController.createBlog)
    .delete(blogController.deleteAllBlogs);

router
    .route('/:id')
    .get(blogController.getBlog)
    .patch(blogController.updateBlog)
    .delete(blogController.deleteBlog);

module.exports = router;
