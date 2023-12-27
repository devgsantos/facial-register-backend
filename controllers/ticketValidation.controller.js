const axios = require("axios")
const endpoints = require('../environments/endpoints');
const tokenValidation = require("../controllers/tokenValidation.controller")

async function ticketValidation(req, res) {

    const {
        localizador,
        token
    } = req.body

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    let formEncode = `locator=${localizador}&login=dev.ti&pass=Bp#@Producao313`
    //let formEncode = `locator=${localizador}&login=teste&pass=Bp#@teste@123`

    return await axios.post(endpoints.urls.ticketValidation, formEncode, { headers })
    .then(async function (response) {
        if (response) {
            tokenValidation(token, res, true);
        }
    })
    .catch(function (error) {
        console.log(error)
        if (error) {
            //O front tava empilhando as request quando dava erro
            //Entao chamamos a funcao para setar o token para invalido

            // res.status(400).send({
            //     status: false,
            //     message: 'Falha na validação do ticket.',
            //     error: JSON.stringify(error)
            // })
            console.log(error)
            tokenValidation(token, res, false);
        } 
        
    });
}

module.exports = ticketValidation;
