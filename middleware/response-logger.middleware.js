const oracledb = require('oracledb');
const dbConfig = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

async function responseLogRegister(req, res, next) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const uuid = uuidv4();

        const localizador = (req.body?.localizador ?? req.dados?.localizador ?? res.body?.localizador ?? res.dados?.localizador ?? '');
        const idBilhete = (req.body?.idBilhete ?? req.dados?.idBilhete ?? res.body?.idBilhete ?? '');
        const dataNascimento = (req.body?.dataNascimento ?? req.dados?.dataNascimento ?? res.body?.dataNascimento ?? '');
        const dataCheckin = (req.body?.dataCheckin ?? req.dados?.dataCheckin ?? res.body?.dataCheckin ?? '');
        const cpf = (req.body?.cpf ?? req.dados?.cpf ?? res.body?.cpf ?? res.dados?.cpf ?? '');
        const nome = (req.body?.nome ?? req.dados?.nome ?? res.body?.nome ?? res.dados?.nome ?? '');
        const photo = res.data?.[0]?.photo ?? req.body?.photo ?? '';
        const token = res.dados ?? req.body?.token ?? res.body?.token  ?? '';
        const unike_foto_id = req.data?.[0]?.id ?? req.body?.oldData?.id ?? req.photo ?? '';
        const mensagem = ((req.card ? `CardNumber: ${req.card}-` : '') + (req.doc ? `documentNumber: ${req.doc}-` : '') + (req.mensagem ?? req.message ?? '')).substring(0, 999);
        const status = res.status?.toString() ?? res.statuscode ?? '';

        // Convertendo a string para um CLOB
        const dsResponseClob = await connection.createLob(oracledb.CLOB);
        dsResponseClob.write(0, JSON.stringify(req /*res*/).replaceAll("'", "").replaceAll('"', '"'), 'utf8');

        const insertQuery = `
            INSERT INTO bpreceptor.iframe_api_registro_log (
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
                unike_foto_id,
                token,
                mensagem,
                st_code
            ) VALUES (
                CURRENT_DATE,
                :uuid,
                'Cliente',
                :url,
                :ip,
                '',
                '',
                CURRENT_DATE,
                :dsRequest,
                :dsResponse,
                :localizador,
                substr(:idBilhete, 1, 100),
                :dataNascimento,
                :dataCheckin,
                :cpf,
                :nome,
                :unike_foto_id,
                :token,
                :mensagem,
                :status
            )`;

        const binds = {
            uuid,
            url: res.url,
            ip: res.ip,
            dsRequest: '',
            dsResponse: dsResponseClob,
            localizador,
            idBilhete,
            dataNascimento,
            dataCheckin,
            cpf,
            nome,
            unike_foto_id,
            token,
            mensagem,
            status
        };

        await connection.execute(insertQuery, binds, { autoCommit: true });

        await connection.close();
        next();
    } catch (error) {
        console.error('Error inserting into database:', error);
        next(error);
    }
}

module.exports = responseLogRegister;
