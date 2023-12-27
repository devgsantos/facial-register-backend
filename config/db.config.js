const oracledb = require('oracledb');
const path = require('path');

const cwd = process.cwd();
const pastaOracleClient = path.join(cwd, 'oracle', 'instantclient_21_11');

// Oracle dev windows
oracledb.initOracleClient({ libDir: "C:\\Oracle\\instantclient_21_11" });

// Oracle prod linux
// oracledb.initOracleClient({ libDir: pastaOracleClient });

// Configuração da conexão
const dbConfig = {
  user: 'user',
  password: 'user',
  connectString: 'database.meudominio.com.br/desenv'
};

let db;

async function connectDatabase() {
  try {
    db = await oracledb.getConnection(dbConfig);
    console.log('Conexão com banco efetuada com sucesso.')
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', err);
    reconnect();
  }
}

function reconnect() {
  console.log('Tentando reconectar ao banco de dados em 2 segundos... ' + new Date());
  setTimeout(() => {
    connectDatabase();
  }, 2000);
}

connectDatabase();

module.exports =  { getConnection: () => db } // Exporta a conexão atual

