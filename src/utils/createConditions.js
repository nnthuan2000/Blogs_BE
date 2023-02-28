const { Op } = require('sequelize');

module.exports = (query) => {
    const queryConditions = Object.keys(query).reduce(
        (conditions, param) => {
            if (param === 'sort') {
                conditions.order = [query[param].split(',')];
            } else if (param === 'limit') {
                conditions.limit = parseInt(query[param], 10);
            } else if (param === 'offset') {
                conditions.offset = parseInt(query[param], 10);
            } else if (param === 'fields') {
                conditions.attributes = query[param].split(',');
            } else {
                const value = query[param];

                if (typeof value === 'object') {
                    const [operator] = Object.keys(value);
                    const v = value[operator];
                    conditions.where[param] = { [Op[operator]]: v };
                } else {
                    conditions.where[param] = value;
                }
            }
            return conditions;
        },
        { where: {} }
    );

    return queryConditions;
};
