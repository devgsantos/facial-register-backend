const axios = require("axios")
const endpoints = require('../environments/endpoints');
const db = require('../config/db.config');


async function sendTicket(req, res) {
    try {
        const dados = req.body;
        const token = await getToken(req, res);
    
        let ticket = '';
        let localizador = '';
        let idbilhete = '';
        if (req.body) {
            try {
                localizador = dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'localizador').fieldValue : "") : ""
                localizador = localizador.includes(dados.localizador) ? localizador : (localizador != "" ? localizador + '|' : "") + dados.localizador

                idbilhete = dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'idBilhete').fieldValue : "") : ""
                idbilhete = idbilhete.includes(dados.idBilhete) ? idbilhete : (idbilhete != "" ? idbilhete + '|' : "") + dados.idBilhete
                idbilhete = idbilhete.replaceAll('NaN', '|')

                ticket = {
                    "accessEndDatetime": new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString(),
                    "accessStartDatetime": new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString(),
                    "cardNumber": dados.oldData ? dados.oldData.cardNumber : dados.localizador,
                    "documentNumber": dados.oldData ? dados.oldData.documentNumber : ( dados.cpf != '' ? dados.cpf : dados.idBilhete ),
                    "jokerList": [{
                        "fieldDesc": "Número Reserva",
                        "fieldName": "numeroReserva",
                        "fieldValue": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'numeroReserva').fieldValue : "") : "",
                        "required": false
                    }, {
                        "fieldDesc": "UH",
                        "fieldName": "uh",
                        "fieldValue": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'uh').fieldValue : "") : "",
                        "required": false
                    }, {
                        "fieldDesc": "Hotel",
                        "fieldName": "hotel",
                        "fieldValue": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'hotel').fieldValue : "") : "",
                        "required": false
                    }, {
                        "fieldDesc": "Data Checkin",
                        "fieldName": "dataCheckin",
                        "fieldValue": dados.dataCheckin,
                        "required": false
                    }, {
                        "fieldDesc": "Data Checkout",
                        "fieldName": "dataCheckout",
                        "fieldValue": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'dataCheckout').fieldValue : "") : "",
                        "required": false
                    }, {
                        "fieldDesc": "Localizador Travel",
                        "fieldName": "localizador",
                        "fieldValue": localizador,
                        "required": false
                    }, {
                        "fieldDesc": "ID Bilhete",
                        "fieldName": "idBilhete",
                        "fieldValue": idbilhete,
                        "required": false
                    }, {
                        "fieldDesc": "Tipo",
                        "fieldName": "tipo",
                        "fieldValue": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'tipo').fieldValue : "") : "",
                        "required": false            
                    }, {
                        "fieldDesc": "Data de Nascimento",
                        "fieldName": "dataNascimento",
                        "fieldValue": dados.dataNascimento.length === 8 ? convertData(dados.dataNascimento) : dados.dataNascimento,
                        "required": false              
                    },
                    {
                        "fieldDesc": "Tipo Ingresso",
                        "fieldName": "tipoIngresso",
                        "fieldValue": dados.tipoIngresso,
                        "required": false              
                    }   
                        ],
                    "email": dados.oldData ? dados.oldData.email : "",
                    "groupList": [
                        "vst"
                    ],
                    "name": dados.nome.substring(0,45),
                    "photo": dados.foto.split(',')[1] ? dados.foto.split(',')[1] : dados.foto,
                        "twoFactorAuthentication": false,
                    "usersChildrenList": [
                        "meudominio"
                    ]
                }

                let registro = {
                    "numeroReserva": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'numeroReserva').fieldValue : "") : "",
                    "uh": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'uh').fieldValue : "") : "",
                    "hotel": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'hotel').fieldValue : "") : "",
                    "dataCheckin": dados.dataCheckin,
                    "dataCheckout": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'dataCheckout').fieldValue : "") : "",
                    "localizador": dados.localizador,
                    "idBilhete": dados.idBilhete,
                    "localizadorUnike": localizador,
                    "idBilheteUnike": idbilhete,
                    "cpf": dados.cpf,
                    "idfoto": dados.oldData ? (dados.oldData.id ?? "") : "",
                    "tipo": dados.oldData ? (dados.oldData.jokerList ? dados.oldData.jokerList.find(p => p.fieldName == 'tipo').fieldValue : "") : "",
                    "dataNascimento": dados.dataNascimento,
                    "tipoIngresso": dados.tipoIngresso,
                    "email": dados.oldData ? dados.oldData.email : "",
                    "name": dados.nome,
                    "comprovanteResidenciaOri": dados.comprovanteResidencia,
                    "cardNumber": dados.oldData ? dados.oldData.cardNumber : dados.localizador,
                    "documentNumber": dados.oldData ? dados.oldData.documentNumber : ( dados.cpf != '' ? dados.cpf : dados.idBilhete ),
                }
                
                const _headers = {
                    "Authorization": "Bearer " + token
                }
            
                return await axios.post(endpoints.urls.personSave, ticket, { headers: _headers })
                .then(async function (response) {
                    if (response.data.code == '200' && response.data.description == "Success") {
                        insertCadastro(registro, res, response)
                        //Tratativa para remover o insertCadastro
                        // res.status(200).send({
                        //     status: true,
                        //     message: 'Dados do ingresso enviados com sucesso.',
                        //     photo: (response.data?.data?.id ? response.data.data.id : ''),
                        //     card: (response.data?.data?.cardNumber ? response.data.data.cardNumber : ''),
                        //     doc: (response.data?.data?.documentNumber ? response.data.data.documentNumber : '')
                        // })
                    }
                })
                .catch(function (error) {
                    console.log(error)
                    if (error.response.status == 409) {
                        res.status(409).send({
                            status: false,
                            message: error.response.data.description,
                            photo: '',
                            card: '',
                            doc: ''
                        })
                    } else {
                        res.status(400).send({
                            status: false,
                            message: ( (error.message ? error.message : 'Falha na API.') + " " + (error.response?.data ? JSON.stringify(error.response.data) : "") ),
                            description: error.response?.data ? error.response?.data.description : 'Falha no reconhecimento da imagem. Por favor, tire outra foto e envie novamente.',
                            photo: '',
                            card: '',
                            doc: ''
                        })
                    }
                    
                });
            } catch (error) {
                res.status(400).send({
                    status: false,
                    message: 'Falha no consumo da API.',
                    photo: '',
                    card: '',
                    doc: ''
                })
            }
        } else {
            res.status(400).send({
                status: false,
                message: 'Sem valores para processar.',
                photo: '',
                card: '',
                doc: ''
            })
        }
    } catch (error) {
        console.log("Falha na autenticação. Detalhes do erro: " + error.message)
        res.status(401).send({
          status: false,
          message: "Falha na autenticação. Detalhes do erro: " + error.message
        });
    }  
}

async function getToken(req, res) {
    const login = {
        username : "user",
        password: "@user335"
    }
    try {
        const response = await axios.post(endpoints.urls.personSaveToken, login);
        if (response && response.status === 200) {
          return response.data;
        }
      } catch (error) {
        throw error; // Não envie a resposta aqui, apenas lance o erro para ser tratado na função photoIdentify
      }
}


async function updateFace() {
    let form = new FormData();

    form.append()

    form.append()
    return await axios.post(endpoints.urls.personSave, ticket, { headers: _headers })
    .then(async function (response) {
    if (response.data.code == '200' && response.data.description == "Success") {
        return await response.data.description;
        // res.status(200).send({
        //     status: true,
        //     message: 'Dados do ingresso enviados com sucesso.'
        // })
    }
    })
    .catch(function (error) {
        if (error.status == 409 && error.response.data.code == 'face_already_associated') {
            updateFace(dados)
        }
        return error
    // res.status(error.response.status).send({
    //     status: false,
    //     message: JSON.stringify(error.response)
    // })
    });
}

function convertData(string) {
    dia = string.substring(0,2);
    mes = string.substring(2,4);
    ano = string.substring(4,8);
    return ano + '-' + mes + '-' + dia
}


async function insertCadastro(registro, res, response) {
    try {
       

        await db.getConnection().execute(
            `
                INSERT INTO bpreceptor.iframe_cadastro_facial
                (
                    numeroReserva,
                    uh,
                    hotel,
                    dataCheckin,
                    dataCheckout,
                    localizador,
                    idBilhete,
                    tipo,
                    dataNascimento,
                    tipoIngresso,
                    email,
                    name,
                    cardNumber,
                    documentNumber,
                    data_create,
                    localizador_unike,
                    idbilhete_unike,
                    cpf,
                    idfoto,
                    comprovantenomeori
                )
                VALUES
                (
                    CASE WHEN '${registro.numeroReserva}' IS NOT NULL AND '${registro.hotel}' <> '' THEN TO_NUMBER('${registro.numeroReserva}') ELSE NULL END,
                    SUBSTR('${registro.uh}', 1, 8),
                    CASE WHEN '${registro.hotel}' IS NOT NULL AND '${registro.hotel}' <> '' THEN TO_NUMBER('${registro.hotel}') ELSE NULL END,
                    '${registro.dataCheckin}',
                    CASE WHEN '${registro.dataCheckout}' IS NOT NULL AND '${registro.dataCheckout}' <> '' THEN '${registro.dataCheckout}' ELSE NULL END,
                    SUBSTR('${registro.localizador}', 1, 10),
                    CASE WHEN '${registro.idBilhete}' IS NOT NULL AND '${registro.idBilhete}' <> '' THEN TO_NUMBER('${registro.idBilhete}') ELSE 0 END,
                    SUBSTR('${registro.tipo}', 1, 50),
                    CASE WHEN '${registro.dataNascimento.length === 8 ? convertData(registro.dataNascimento) : registro.dataNascimento}' IS NOT NULL THEN '${registro.dataNascimento.length === 8 ? convertData(registro.dataNascimento) : registro.dataNascimento}' ELSE NULL END,
                    SUBSTR('${registro.tipoIngresso}', 1, 50),
                    SUBSTR('${registro.email}', 1, 200),
                    SUBSTR('${registro.name.replace(/[^\w\s]/gi, '')}', 1, 255),
                    SUBSTR('${registro.cardNumber}', 1, 14),
                    SUBSTR('${registro.documentNumber}', 1, 16),
                    CURRENT_TIMESTAMP,
                    SUBSTR('${registro.localizadorUnike}', 1, 200),
                    SUBSTR('${registro.idBilheteUnike}', 1, 200),
                    SUBSTR('${registro.cpf}', 1, 11),
                    SUBSTR('${registro.idfoto}', 1, 24),
                    SUBSTR('${registro.comprovanteResidenciaOri}', 1, 200)
                ) 
            `
        );
        await db.getConnection().commit();
        res.status(200).send({
            status: true,
            message: 'Dados do ingresso enviados com sucesso.',
            photo: (response.data?.data?.id ? response.data.data.id : ''),
            card: (response.data?.data?.cardNumber ? response.data.data.cardNumber : ''),
            doc: (response.data?.data?.documentNumber ? response.data.data.documentNumber : '')
        })
    } catch (err) {
        await db.getConnection().rollback();
        console.log("Ocorreu erro ao salvar dados na tabela cadastro_facial");
        console.log(err);
        res.status(200).send({
            // status: false,
            // message: 'Dados do ingresso enviados com sucesso, mas com falha ao salvar os dados no registro de log.',
            // dados: JSON.stringify(err)
            status: true,
            message: 'Dados do ingresso enviados com sucesso, mas com falha ao salvar os dados no registro de log.',
            photo: (response.data?.data?.id ? response.data.data.id : ''),
            card: (response.data?.data?.cardNumber ? response.data.data.cardNumber : ''),
            doc: (response.data?.data?.documentNumber ? response.data.data.documentNumber : '')
        });
    }
}


module.exports = sendTicket

