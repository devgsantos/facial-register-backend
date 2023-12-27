const db = require('../config/db.config');



async function checkTicket(req, res) {
    const { localizador, cpfTitular } = req.body
    try {
       
        const query = `
            SELECT 
                * 
            FROM 
                bpreceptor.iframe_registro_ticket_parcial
            WHERE 
                localizador = :localizador
            AND
                cpfTitular = :cpfTitular
        `;

        const result = await db.getConnection().execute(query, {
            localizador,
            cpfTitular
        });

        if (result.rows.length > 0) {
            res.status(200).send({
                status: true,
                message: 'Registros encontrados',
                dados: result.rows
            });
        } else {
            res.status(200).send({
                status: false,
                message: 'Não há registros encontrados',
                dados: []
            });
        }
    } catch (error) {
        console.error(error);
        return error;
    }
}

module.exports = checkTicket