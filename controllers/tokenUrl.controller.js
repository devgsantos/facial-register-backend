const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const db = require('../config/db.config');


async function decryptToken(req, res) {
    const tokeValid = await validarToken(req.body.token, res);

    const options = {
        clockTimestamp: Math.floor(Date.now() / 1000), // define o valor do timestamp atual
        clockTolerance: 7776000 // define uma tolerância de 16 hpras segundos / 90 Dias
    };

    if (tokeValid.rows.length >= 1) {
        jwt.verify(req.body.token, config.secret, options, (err, decoded) => {
            if (decoded) {
                delete decoded.iat;
                delete decoded.exp;
                res.status(200).send({
                    status: true,
                    message: 'Paramêtro tokenizado decriptado com sucesso!',
                    dados: decoded
                })
            }
            if (err) {
                res.status(400).send({
                    status: true,
                    message: 'Falha na decripitação.',
                    dados: JSON.stringify(err)
                }) 
            }
        });
    } else {
        res.status(401).send({
            status: false,
            message: 'Token inválido ou já utilizado.',
        })
    }

}

async function validarToken(token) {
  try {
   
    const query = `
      SELECT 
        * 
      FROM 
        bpreceptor.iframe_dados_token
      WHERE 
        token = :token
      AND
        valido = 1
    `;

    return await db.getConnection().execute(query, { token });;
  } catch (error) {
    console.error(error);
    return error;
  }
}
  

module.exports = decryptToken;