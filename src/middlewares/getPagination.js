exports.getPagination = (req, res, next) => {
    const { size: limit = 3, page: offset = 0 } = req.query;
    req.query.limit = limit;
    req.query.offset = offset * limit;
    delete req.query.size;
    delete req.query.page;

    next();
};
