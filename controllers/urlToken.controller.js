const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const db = require('../config/db.config');

const { response } = require("express");


async function tokenization(req, res) {

    // ?tipoIngresso=avulso&nome=Carlos Miguel&dataNascimento=1985-12-31&localizador=95xcKo3&idBilhete=585645-78&dataCheckin=2023-04-04

    const { 
        tipoIngresso, 
        nome,
        dataNascimento, 
        localizador,
        idBilhete,
        dataCheckin,
        cpf
      } = req.body

    const ticketData = {
        tipoIngresso: tipoIngresso,
        nome: nome,
        dataNascimento: dataNascimento,
        localizador: localizador,
        idBilhete: idBilhete,
        dataCheckin: dataCheckin,
        cpf: cpf
    }

    // let expireDate = daysDiff(dataCheckin);
    let expirationDate  = new Date(dataCheckin);
    const expTimestamp = Math.floor(expirationDate.getTime() / 1000);

    let token = jwt.sign(ticketData, config.secret, {
        expiresIn: expTimestamp - Math.floor(Date.now() / 1000)
    });
    

    const verificarSeExiteToken = await verificarToken(ticketData, token);

    if (verificarSeExiteToken.rows.length > 0){
        token = verificarSeExiteToken.rows[0][0] 
        console.log('Token ja existe')
        res.status(200).send({
            status: true,
            //message: 'Token ja existe',
            message: 'Token da url gerado com sucesso e dados salvos!',
            dados: token
        })
    }
    else {
        savetoDb(req.body, token, req, res)
    } 
   
}

function daysDiff(checkin) {
    const date1 = new Date();
    const date2 = new Date(checkin);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

//   tipoIngresso varchar(50) DEFAULT NULL,
//   nome varchar(200) DEFAULT NULL,
//   dataNascimento timestamp NULL DEFAULT NULL,
//   localizador varchar(50) DEFAULT NULL,
//   idBilhete varchar(400) DEFAULT NULL,
//   dataCheckin timestamp NULL DEFAULT NULL,
//   token varchar(500) DEFAULT NULL,
//   data_create timestamp NULL DEFAULT NULL,

async function savetoDb(data, token, req, res) {
    try {
       
        const { 
            tipoIngresso, 
            nome,
            dataNascimento, 
            localizador,
            idBilhete,
            dataCheckin,
            cpf
        } = data

        await db.getConnection().execute(
            `
            INSERT INTO
                bpreceptor.iframe_dados_token
            (
                tipoIngresso,
                nome,
                dataNascimento,
                localizador,
                idBilhete,
                dataCheckin,
                token,
                data_create,
                cpf,
                valido
            )
            VALUES(
                '${tipoIngresso}',
                '${nome}',
                TO_TIMESTAMP('${dataNascimento.substr(0,4) >= '1970' ? dataNascimento : "1970-" + dataNascimento.substr(5,20)} 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF'),
                '${localizador}',
                '${idBilhete}',
                TO_TIMESTAMP('${dataCheckin} 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.FF'),
                '${token}',
                CURRENT_TIMESTAMP,
                '${cpf}',
                1
            )   
            `
        );
        await db.getConnection().commit();
        res.status(200).send({
            status: true,
            message: 'Token da url gerado com sucesso e dados salvos!',
            dados: token
        })
    } catch (error) {
        await db.getConnection().rollback();
        console.error('Erro ao salvar token no banco de dados', error);
        res.status(500).send({
            status: false,
            message: 'Ocorreu um erro ao salvar o token no banco de dados. Por favor, tente novamente mais tarde.',
            error: error.toString()
        })
    }
}


async function verificarToken(ticketData, token) {
    try {
       
        return await db.getConnection().execute(`
            SELECT 
                distinct token
            FROM 
                bpreceptor.iframe_dados_token
            WHERE 1=1
            AND localizador = '${ticketData.localizador}'
            AND idBilhete = '${ticketData.idBilhete}'
            AND valido = 1
        `)
    } catch (err) {
        // Loga o erro
        console.error('Erro ao verificar token no banco de dados', err);
        
        // Retorna um valor de erro mais descritivo para o chamador da função
        return { error: 'Erro ao verificar o token no banco de dados. Por favor, tente novamente mais tarde.' };
    }
}


module.exports = tokenization
