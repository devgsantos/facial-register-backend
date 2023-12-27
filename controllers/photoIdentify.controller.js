const axios = require("axios")
const endpoints = require('../environments/endpoints');
const { Blob } = require("buffer");
const fs = require('fs');


async function photoIdentify(req, res) {
    try {
        const token = await getToken(req, res);
    
        let formData = new FormData();

        let base64Image = req.body.photo.split(';base64,').pop() ? req.body.photo.split(';base64,').pop() : req.body.photo;

        const file = convert(base64Image)

        formData.append('photo', file, { filename : 'photo.png' });

        const _headers = {
            "Authorization": "Bearer " + token,
            'Content-Type': 'multipart/form-data'
        }

        return await axios.post(endpoints.urls.photoIdentify, formData , { headers: _headers })
        .then(async function (response) {
            if (response.data == [] || response.data == '') {
                res.status(200).send({
                    status: true,
                    photo: false,
                    data: response.data,
                    message: 'Nenhuma imagem correspondente encontrada.'
                })
            } else if (response.data[0].id && response.data[0].photo) {
                res.status(200).send({
                    status: true,
                    photo: true,
                    data: response.data,
                    message: 'Usuário já possui foto no banco de dados.'
                })
            } else {
                res.status(200).send({
                    status: true,
                    data: response.data,
                    message: JSON.stringify(response.data)
                })
            }
        })
        .catch(function (error) {
            res.status(error.response.status).send({
                status: false,
                message: ( (error.message ? error.message : 'Falha na API.') + ", " + (error.response?.data ? JSON.stringify(error.response.data.description) : "") )
            })
        });
    } catch (error) {
        console.log("Falha na autenticação. Detalhes do erro: " + error.message)
        res.status(401).send({
          status: false,
          message: "Falha na autenticação. Detalhes do erro: " + error.message
        });
    }

}

function convert(string) {
    let byteCharacters = atob(string);
    let byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    let blob = new Blob([byteNumbers], { type: 'image/jpeg' });
    return blob;
}


async function getToken(req, res) {
    const login = {
        username : "username",
        password: "@username"
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

module.exports = photoIdentify;
