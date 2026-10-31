const { conectar } = require('../config/database');

async function buscarPorEmail(email) {
  const pool = await conectar();
  const [rows] = await pool.execute(
    'SELECT id, nome, email, senha_hash FROM clientes WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function cadastrar({ nome, email, senhaHash }) {
  const pool = await conectar();
  const [resultado] = await pool.execute(
    'INSERT INTO clientes (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );
  return buscarDadosPublicosPorId(resultado.insertId);
}

async function buscarDadosPublicosPorId(id) {
  const pool = await conectar();
  const [rows] = await pool.execute(
    'SELECT id, nome, email, criado_em FROM clientes WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function buscarCredenciaisPorId(id) {
  const pool = await conectar();
  const [rows] = await pool.execute(
    'SELECT id, email, senha_hash FROM clientes WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function atualizarDados(id, { nome, email }) {
  const pool = await conectar();
  await pool.execute(
    'UPDATE clientes SET nome = ?, email = ? WHERE id = ?',
    [nome, email, id]
  );
  return buscarDadosPublicosPorId(id);
}

async function excluirConta(id) {
  const pool = await conectar();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute(
      'DELETE FROM password_reset_tokens WHERE cliente_id = ?',
      [id]
    );
    const [resultado] = await connection.execute(
      'DELETE FROM clientes WHERE id = ?',
      [id]
    );
    await connection.commit();
    return resultado.affectedRows > 0;
  } catch (erro) {
    await connection.rollback().catch(() => {});
    throw erro;
  } finally {
    connection.release();
  }
}

async function salvarTokenRecuperacao(clienteId, tokenHash, expiraEm) {
  const pool = await conectar();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute(
      'DELETE FROM password_reset_tokens WHERE cliente_id = ?',
      [clienteId]
    );
    await connection.execute(
      'INSERT INTO password_reset_tokens (cliente_id, token_hash, expira_em) VALUES (?, ?, ?)',
      [clienteId, tokenHash, expiraEm]
    );
    await connection.commit();
  } catch (erro) {
    await connection.rollback().catch(() => {});
    throw erro;
  } finally {
    connection.release();
  }
}

async function redefinirSenhaComToken(tokenHash, senhaHash) {
  const pool = await conectar();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [tokens] = await connection.execute(
      'SELECT id, cliente_id FROM password_reset_tokens ' +
      'WHERE token_hash = ? AND expira_em > UTC_TIMESTAMP() AND usado_em IS NULL ' +
      'LIMIT 1 FOR UPDATE',
      [tokenHash]
    );

    const token = tokens[0];
    if (!token) {
      await connection.rollback();
      return false;
    }

    await connection.execute(
      'UPDATE clientes SET senha_hash = ? WHERE id = ?',
      [senhaHash, token.cliente_id]
    );
    await connection.execute(
      'UPDATE password_reset_tokens SET usado_em = UTC_TIMESTAMP() WHERE id = ?',
      [token.id]
    );

    await connection.commit();
    return true;
  } catch (erro) {
    await connection.rollback().catch(() => {});
    throw erro;
  } finally {
    connection.release();
  }
}

module.exports = {
  buscarPorEmail,
  cadastrar,
  buscarDadosPublicosPorId,
  buscarCredenciaisPorId,
  atualizarDados,
  excluirConta,
  salvarTokenRecuperacao,
  redefinirSenhaComToken
};
