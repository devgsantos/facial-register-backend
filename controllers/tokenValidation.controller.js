const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const db = require('../config/db.config');


async function tokenValidation(token, res, status) {
  try {

    const updateQuery = `
      UPDATE 
        bpreceptor.iframe_dados_token
      SET
        valido = 0, 
        confirma_novaxs = :status
      WHERE
        token = :token
    `;

    const selectQuery = `
        SELECT 
            *
        FROM 
            bpreceptor.iframe_dados_token
        WHERE
            token = :token
    `;

    const updateResult = db.getConnection().execute(updateQuery, { status: status ? '1' : '0', token });
    db.getConnection().commit();

    if (updateResult.rowsAffected > 0) {
      const dados = db.getConnection().execute(selectQuery, { token });
      res.status(200).send({
        status: true,
        message: 'Validação de localizador e token concluídas com sucesso!',
        dados: dados.rows
      });
    } else {
      res.status(200).send({
        status: true,
        message: 'Nenhum registro alterado.'
      });
    }
  } catch (error) {
    db.getConnection().rollback();

    console.error(error);

    res.status(500).json({ error: 'Erro ao efetuar update.' });
  }
}


module.exports = tokenValidation

