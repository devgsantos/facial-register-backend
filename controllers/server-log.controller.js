const db = require('../config/db.config');

const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();


function logCheck() {

}

async function logRegister(data) {
    const type = ''

    await db.getConnection().execute(
        `
        INSERT INTO
            bpreceptor.iframe_api_registro_log
        (
            time_log,
            uuid,
            tp_log,
            nm_servico,
            nr_ip_cliente,
            nr_ip_servidor,
            ts_inicial,
            ts_final,
            ds_request,
            ds_response,
            nr_localizador,
            id_bilhete,
            dt_nasci,
            dt_checkin,
            nr_cpf,
            nome,
            foto,
            comprovante,
            token,
            unike_foto_id
        )
        VALUES(
            CURRENT_TIMESTAMP,
            '${uuid}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}',
            '${''}'            
        )   
        `
    )
    
    await db.getConnection().commit();

}

function logUpdate() {

}