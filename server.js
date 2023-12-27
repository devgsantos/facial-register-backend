const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (!cluster.isMaster) {
  // Code to run if this is the master process

  // Create workers equal to the number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle when a worker process exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });

  // Fork a separate worker for the cron
  const cronWorker = cluster.fork();
  cronWorker.send({ type: 'cron' });

} else {
  // Code to run if this is a worker process

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

  // Rest of your middleware and route setup

  // ...

  // Start the server
  const PORT = process.env.PORT || 5001;
  if (env === 'dev') {
    // SSL configuration
    const privateKey = fs.readFileSync(__dirname + '\\ssldev\\localhost.key');
    const certificate = fs.readFileSync(__dirname + '\\ssldev\\localhost.crt');
    const credentials = { key: privateKey, cert: certificate };

    routes(app);

    const server = https.createServer(credentials, app);

    process.on('message', (msg) => {
      if (msg && msg.type === 'cron') {
        startCron();
      }
    });

    server.listen(PORT, () => {
      console.log(`Servidor HTTPS rodando em https://localhost:${PORT}`);
    });

  } else {
    process.on('message', (msg) => {
      if (msg && msg.type === 'cron') {
        startCron();
      }
    });

    routes(app);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  }

  function startCron() {
    cron.schedule('*/10 * * * *', () => {
      console.log('Update a cada 10 minutos.');
      mainNovaXs();
    });
  }
}
