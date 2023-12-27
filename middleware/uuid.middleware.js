const { v4: uuidv4 } = require('uuid');

function uuidMiddleware(req, res, next) {
    const uuid = uuidv4();
    req.uuid = uuid;
    res.set('X-Request-ID', uuid);
    next();
}

module.exports = uuidMiddleware;