const db = require('../config/db.config');

const sharp = require('sharp');

async function savePartialTicket(req, res) {
    // Salvar parcialmente

    try {
        // for (let i = 0; i < utilizadores.length; i++) {
        //     console.log("Inserindo utilizador: Localizador " + utilizadores[i].localizador + " Bilhete " + utilizadores[i].idBilhete+ " Nome " + utilizadores[i].nome)

        //     const validateResponse = await insertData(req.body, i);

        //     console.log("Valor Insert")
        //     console.log(validateResponse)

        //     if (validateResponse && validateResponse.affectedRows >= 1) {
        //         console.log("Salvo com sucesso. Localizador " + utilizadores[i].localizador + " Bilhete " + utilizadores[i].idBilhete+ " Nome " + utilizadores[i].nome)
        //     } else {
        //         console.log("Nenhum registro inserido ou alterado. Localizador " + utilizadores[i].localizador + " Bilhete " + utilizadores[i].idBilhete+ " Nome " + utilizadores[i].nome)
        //     }
        // }

        console.log("Inserindo utilizador: Localizador " + req.body.localizador + " Bilhete " + req.body.idBilhete+ " Nome " + req.body.nome)

        const validateResponse = await insertData(req.body);
       
        console.log("Valor Insert")
        console.log(validateResponse)

        if (validateResponse && validateResponse.rowsAffected >= 1) {
            console.log("Salvo com sucesso. Localizador " + req.body.localizador + " Bilhete " + req.body.idBilhete+ " Nome " + req.body.nome)
            res.status(200).send({
                status: true,
                message: 'Salvo com sucesso.'
            });
        } else {
            console.log("Nenhum registro inserido ou alterado. Localizador " + req.body.localizador + " Bilhete " + req.body.idBilhete+ " Nome " + req.body.nome)
            res.status(200).send({
                status: true,
                message: 'Nenhum registro inserido ou alterado.'
            });
        }

        //Retornando sucesso caso todos retornem ok
       
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: 'Erro ao processar os dados para insert registro_ticket_parcial.'
        });
    }

}




// FUNÇÃO SEM ON DUPLICATE KEY
async function insertData(ticket) {
    try {
        // Filtrar caracteres especiais de nomeTitular e nome
        const nomeTitularLimpo = ticket.nomeTitular.replace(/[^\w\s]/gi, '');
        const nomeLimpo = ticket.nome.replace(/[^\w\s]/gi, '');

        const imageReduced = await reduceImageQuality(ticket.foto);

        const query = `
            INSERT INTO bpreceptor.iframe_registro_ticket_parcial (
                localizador,
                nome_titular,
                cpfTitular,
                dataCheckin,
                dataNascimentoTitular,
                idBilheteTitular,
                tipoIngresso,
                idBilhete,
                nome,
                dataNascimento,
                cpf,
                foto,
                unikeId,
                comprovanteResidencia,
                dataUpdateBilhete,
                token
            ) VALUES (
                :localizador, 
                :nomeTitular, 
                :cpfTitular, 
                :dataCheckin, 
                :dataNascimentoTitular, 
                :idBilheteTitular, 
                :tipoIngresso, 
                :idBilhete, 
                :nome, 
                :dataNascimento, 
                :cpf, 
                :foto, 
                :unikeId, 
                'ENVIADO', 
                CURRENT_TIMESTAMP, 
                :token
            ) 
        `;

        const values = {
            /* parametros VALUES */
            localizador: ticket.localizador,
            nomeTitular: nomeTitularLimpo,
            cpfTitular: ticket.cpfTitular,
            dataCheckin: ticket.dataCheckin,
            dataNascimentoTitular: ticket.dataNascimentoTitular,
            idBilheteTitular: ticket.idBilheteTitular,
            tipoIngresso: ticket.tipoIngresso,
            idBilhete: ticket.idBilhete,
            nome: nomeLimpo,
            dataNascimento: ticket.dataNascimento,
            cpf: ticket.cpf,
            unikeId: ticket.unikeId,
            foto: imageReduced,
            token: ticket.token
        };

        // Executar a inserção
        const result = await db.getConnection().execute(query, values);

        // Commit da transação
        await db.getConnection().commit();

        return result;
    } catch (err) {
        console.log("Ocorreu um erro ao salvar dados na tabela registro_ticket_parcial");
        console.error('Erro do insert', err);
        
        // Reverter a transação em caso de erro
        await db.getConnection().rollback();

        return err;
    }
}




async function reduceImageQuality(base64String) {
    try {
        // Decodifica a string base64 em um buffer
        const buffer = Buffer.from(base64String, 'base64');

        // Reduz a qualidade da imagem utilizando o sharp
        const reducedBuffer = await sharp(buffer)
        .webp({ quality: 10 }) // Defina o formato e a qualidade desejada (neste caso, JPEG)
        .toBuffer();

        // Retorna a imagem em base64 com a qualidade reduzida 
        return reducedBuffer.toString('base64');
    } catch (error) {
        console.error('Erro ao reduzir a qualidade da imagem:', error);
        return null;
    }
}

module.exports = savePartialTicket
