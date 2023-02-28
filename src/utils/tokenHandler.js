const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const authConfig = require('../configs/authConfig');

exports.generateToken = async (infos, type) => {
    const infoOfToken = authConfig[type];
    const token = await promisify(jwt.sign)(infos, infoOfToken.secret, {
        expiresIn: infoOfToken.expiresIn,
    });
    return token;
};

exports.verifyToken = async (token, type) => {
    const infoOfToken = authConfig[type];
    const decoded = await promisify(jwt.verify)(token, infoOfToken.secret);
    return decoded;
};
