const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const fs = require('fs');

function getToken(req, res) {

    const { user, password } = req.body

    const userData = {
        user: 'user',
        password: '123'
    }

    
    
    if (user === userData.user && password === userData.password) {
        const token = jwt.sign({ user: user, password: password }, config.secret, {
            expiresIn: Math.floor(Date.now() / 1000) + (480 * 60)
        });
        return res.status(200).send(token)
    } else {
        return res.status(403).send({
            status: false,
            message: 'Usuário ou senha inválidos.'
        });
    }       
}


module.exports = getToken;