const oracledb = require('oracledb');
const path = require('path');

const cwd = process.cwd();
const pastaOracleClient = path.join(cwd, 'oracle', 'instantclient_21_11');

// Oracle dev windows
// oracledb.initOracleClient({ libDir: "C:\\Oracle\\instantclient_21_11" });

// Oracle prod linux
oracledb.initOracleClient({ libDir: pastaOracleClient });


// Desenv
const dbConfig = {
    user: 'user',
    password: 'user',
    connectString: 'database.meudominio.com.br/desenv'  // O formato é host:porta/serviço
};

let db;

async function connectDatabase() {
    try {
        db = await oracledb.getConnection(dbConfig);
        console.log('Conexão estabelecida com sucesso! ' + new Date());
        return db;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados: ' + new Date(), err);
        reconnect();
    }

    db.on('error', (err) => {
        console.error('Ocorreu um erro na conexão com o banco de dados: ' + new Date(), err);
        if (err.errorNum === 12514) {  // Código de erro para TNS: não foi possível resolver o nome
            reconnect();
        } else {
            throw err;
        }
    });
}

async function closeConnection() {
    if (db) {
        try {
            await db.getConnection().close();
            console.log('Conexão Oracle fechada com sucesso!');
        } catch (err) {
            console.error('Erro ao fechar a conexão Oracle:', err);
        }
    }
}

function reconnect() {
    console.log('Tentando reconectar ao banco de dados em 2 segundos... ' + new Date());
    setTimeout(() => {
        connectDatabase();
    }, 2000);
}


module.exports = {
  connectDatabase,
  closeConnection
};
