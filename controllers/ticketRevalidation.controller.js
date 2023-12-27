const db = require('../config/db.config');


async function ticketRevalidation(req, res) {
    const { token, idBilhete } = req.body;

    try {

        const updateQuery = `
            UPDATE 
                bpreceptor.iframe_dados_token
            SET
                valido = 1
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


        const deleteQuery = `
            DELETE FROM
                bpreceptor.iframe_registro_ticket_parcial
            WHERE
                token = :token
            AND 
                idBilhete = :idBilhete
        `;

        const updateResult = await db.getConnection().execute(updateQuery, { token });
        await db.getConnection().commit();

        if (updateResult.rowsAffected.length > 0) {
            await db.getConnection().execute(deleteQuery, { token, idBilhete });

            await db.getConnection().commit();

            const dados = await db.getConnection().execute(selectQuery, { token });

            res.status(200).send({
                status: true,
                message: 'Devido à falha em algum ingresso, o token e o ingresso foram revalidados. Por favor, repita o processo.',
                dados: dados.rows
            });
        } else {
            res.status(400).send({
                status: false,
                message: 'Falha na revalidação dos ingressos. Esta página será recarregada em 10 segundos. Caso seu token ou ingresso esteja inválido, entre em contato com nossa equipe'
            });
        }
    } catch (error) {
        await db.getConnection().rollback();

        console.error(error);

        res.status(400).send({
            status: false,
            message: 'Falha na revalidação dos ingressos. Esta página será recarregada em 10 segundos. Caso seu token ou ingresso esteja inválido, entre em contato com nossa equipe'
        });
    }
}


module.exports = ticketRevalidation