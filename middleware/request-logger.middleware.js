const oracledb = require('oracledb');
const dbConfig = require('../config/db.config');

async function requestLogRegister(req, res, next) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const { body, uuid, url, ip } = req;
        const {
            localizador = '',
            idBilhete = '',
            dataNascimento = '',
            dataCheckin = '',
            cpf = '',
            nome = '',
            token = '',
        } = body;
        const { mensagem = '', message = '' } = res;

        // Convertendo a string para um CLOB
        const clob = await connection.createLob(oracledb.CLOB);
        clob.write(0, JSON.stringify(body).substring(0, 1500), 'utf8');

        const insertQuery = `
            INSERT INTO bpreceptor.iframe_api_registro_log
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
                token,
                unike_foto_id,
                mensagem
            )
            VALUES (
                CURRENT_TIMESTAMP,
                :uuid,
                'Cliente',
                :url,
                :ip,
                '',
                CURRENT_TIMESTAMP,
                :clob, -- Usando o CLOB aqui
                '',
                '',
                :localizador,
                substr(:idBilhete, 1, 100),
                :dataNascimento,
                :dataCheckin,
                :cpf,
                :nome,
                :token,
                '',
                :mensagem
            )`;

        const binds = {
            uuid,
            url,
            ip,
            clob, // Bind do CLOB
            localizador,
            idBilhete,
            dataNascimento,
            dataCheckin,
            cpf,
            nome,
            token,
            mensagem: mensagem || message
        };

        await connection.execute(insertQuery, binds, { autoCommit: true });

        await connection.close();
        next();
    } catch (error) {
        console.error('Error inserting into database:', error);
        next(error);
    }
}

module.exports = requestLogRegister;
