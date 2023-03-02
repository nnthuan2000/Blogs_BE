const express = require('express');

const blogController = require('../controllers/blogController');

const middlewares = require('../middlewares/getPagination');

const router = express.Router();

router
    .route('/')
    .get(middlewares.getPagination, blogController.getAllBlogs)
    .post(blogController.createBlog);

router
    .route('/:id')
    .get(blogController.getBlog)
    .patch(blogController.updateBlog)
    .delete(blogController.deleteBlog);

module.exports = router;
