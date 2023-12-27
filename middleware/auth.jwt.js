const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js")



function verifyToken (req, res, next) {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            status: false,
            message: 'Token ausente ou inválido.'
        });
    }

    
    jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
        return res.status(401).send({
            status: false,
            message: ' Não autorizado!'
        });
    }
    next();
    });
};


module.exports = verifyToken;

