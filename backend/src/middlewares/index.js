const { verifyToken } = require('./auth.middleware');
const { isAdmin, isRole, isUser } = require('./role.middleware');

module.exports = {
    verifyToken,
    isAdmin,
    isUser,
    isRole,
};