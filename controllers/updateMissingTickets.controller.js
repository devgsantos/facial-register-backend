const axios = require("axios");
const endpoints = require('../environments/endpoints');
const db = require('../config/db.config');


async function mainNovaXs() {

    const updateRows = await selectNovaXs();
    let validateAll = [];

    if (updateRows.rows.length > 0) {
        console.log("Encontrando " + updateRows.rows.length + " para enviar a Nova XS")

        for (let i = 0; i < updateRows.rows.length; i++) {
            console.log("Enviando Ticket para NovaXs: " + updateRows[i].localizador)
            
            const validateRespose = await ticketValidation(updateRows[i].localizador);

            if (validateRespose.update) {
              console.log("Enviado com sucesso: " + validateRespose.localizador)
              updateNovaXs(validateRespose.localizador);
            } else {
              console.log("Falha ao enviar: " + validateRespose.localizador)
            }
        }
    } else {
        console.log("Sem tickets para atualizar.")
    }
    
    // updateNovaXs(validateAll);
    
}


async function selectNovaXs() {
    try {
     
      const results = await db.getConnection().execute(`
        SELECT 
          * 
        FROM 
          bpreceptor.iframe_dados_token
        WHERE 
          confirma_novaxs = 0
          AND datacheckin >= CURRENT_TIMESTAMP
          AND valido = 0
        ORDER BY data_create  DESC
      `);
  
      return results;
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao selecionar os dados da tabela dados_token');
    }
}
  

async function updateNovaXs(localizador) {
  try {
    
    const updateQuery = `
      UPDATE 
        bpreceptor.iframe_dados_token
      SET
        confirma_novaxs = '1'
      WHERE 
        localizador = :localizador
    `;

    const updateResult = await db.getConnection().execute(updateQuery, { localizador });
    await db.getConnection().commit();

    if (updateResult.rowsAffected <= 0) {
      console.error("Tabela não atualizada para o localizador " + localizador);
    }
  } catch (error) {
    console.error(error);

    if (connection) {
      await db.getConnection().rollback();
    }

    throw new Error('Erro ao atualizar os dados da tabela dados_token');
  }
}

  

async function ticketValidation(localizador) {

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    let formEncode = `locator=${localizador}&login=dev.ti&pass=Bp#@Producao313`
    //let formEncode = `locator=${localizador}&login=teste&pass=Bp#@teste@123`

    return await axios.post(endpoints.urls.ticketValidation, formEncode, { headers, timeout: 3000 })
    .then(async function (response) {
        if (response) {
            return { update: true, localizador: localizador }
        }
    })
    .catch(function (error) {
        if (error) {
            return { update: false, localizador: localizador }
        }
    });
}

module.exports = mainNovaXs
