
const axios = require("axios")
const endpoints = require('../environments/endpoints');
const { response } = require("express");

function sendDocument(req, res) {
    axios.post(endpoints.urls.fileManager, {
        "repositorio": "comprovantederesidencia",
        "key": req.body.key,
        "representacaoArquivo": req.body.representacaoArquivo.split(',')[1] ? req.body.representacaoArquivo.split(',')[1] : req.body.representacaoArquivo
      })
      .then(function (response) {
        if (response) {
            res.status(response.status ? response.status : 200).send({
                status: true,
                message: 'Documento enviado com sucesso.'
            })
        }
      })
      .catch(function (error) {
        if (error.response?.status != null && error.response.status === 422){
            //if existe pelo motivo do front esta empilhando a requisicao quando da erro no processo
            //entrao quando enviar o mesmo documento mais de uma vez, o filemaneger retorna 422
            //informando que ja existe o mesmo documento salvo
            res.status(200).send({
              status: true,
              // message: 'Documento enviado com sucesso (2).'
              message: ( (error.message ? error.message : 'Falha na API.') + " " + (error.response?.data ? JSON.stringify(error.response.data) : "") )
          })
        } else {
          res.status(400).send({
              status: false,
              //message: JSON.stringify(error.response.statusText)
              // message: JSON.stringify(error)
              message: ( (error.message ? error.message : 'Falha na API.') + " " + (error.response?.data ? JSON.stringify(error.response.data) : "") )

          })
        }
      });
}

module.exports = sendDocument