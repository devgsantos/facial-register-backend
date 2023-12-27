process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/routes");
const fs = require("fs");
const path = require('path');
const multer = require('multer');
const mainNovaXs = require('./controllers/updateMissingTickets.controller');
var cron = require('node-cron');
const https = require('https');
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: "*"
};

const env = "dev"
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(multer().any());
// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to bezkoder application." });
// });

// cron.schedule('*/1 * * * *', () => {
//   console.log('Update a cada 10 minutos.');
//   mainNovaXs();
// });

const PORT = process.env.PORT || 5001;
if (env === 'dev') {
  
  // SSL Dev sem domínio
  const privateKey = fs.readFileSync(__dirname +  '\\ssldev\\localhost.key');
  const certificate = fs.readFileSync(__dirname +  '\\ssldev\\localhost.crt');

    // SSL Dev com domínio -> dev.local
  // const privateKey = fs.readFileSync(__dirname +  '\\ssldev\\domain\\private_key.key');
  // const certificate = fs.readFileSync(__dirname +  '\\ssldev\\domain\\certificate.crt');

  const credentials = { key: privateKey, cert: certificate };
  routes(app)
  const server = https.createServer(credentials, app);
  cron.schedule('*/10 * * * *', () => {
    console.log('Update a cada 10 minutos.');
    mainNovaXs();
  });
  server.listen(PORT, () => {
    console.log(`Servidor HTTPS rodando em https://localhost:5001`);
  });

} else {
  cron.schedule('*/10 * * * *', () => {
    console.log('Update a cada 10 minutos.');
    mainNovaXs();
  });
  routes(app)
  // set port, listen for requests
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

