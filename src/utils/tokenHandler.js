const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const authConfig = require('../configs/authConfig');

exports.generateToken = (infos, type) =>
    promisify(jwt.sign)(infos, authConfig[type].secret, {
        expiresIn: authConfig[type].expiresIn,
        subject: type,
    });

exports.verifyToken = (token, type) => promisify(jwt.verify)(token, authConfig[type].secret);
