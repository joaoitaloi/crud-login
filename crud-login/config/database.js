require('dotenv').config();

const mysql = require('mysql2/promise');
let poolPromise;

async function conectar() {
  const host = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;

  if (!host || !database || !user || password === undefined) {
    throw new Error('Configure DB_HOST, DB_NAME, DB_USER e DB_PASS no arquivo .env.');
  }

  if (!poolPromise) {
    const pool = mysql.createPool({
      host,
      port: Number(process.env.DB_PORT) || 3306,
      database,
      user,
      password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      charset: 'utf8mb4'
    });

    poolPromise = (async () => {
      try {
        const connection = await pool.getConnection();
        connection.release();
        console.log('Conexão com o MySQL estabelecida.');
        return pool;
      } catch (erro) {
        await pool.end();
        throw erro;
      }
    })().catch((erro) => {
      poolPromise = null;
      console.error('Falha ao conectar ao MySQL:', erro.message);
      throw erro;
    });
  }

  return poolPromise;
}

module.exports = { conectar };
