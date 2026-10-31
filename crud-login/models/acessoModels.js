const { conectar, sql } = require("../config/database");

async function listarUsuarios() {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .query("SELECT * FROM tabelaUsuarios");

    console.log("RESULTADO DO GET:", resultado);
    return resultado.recordset;
  } catch (erro) {
    console.error("Erro ao listar os usuários", erro.message);
    throw erro;
  }
}

async function cadastrarUsuario(usuario) {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .input("nome", sql.VarChar(100), usuario.nome.trim())
      .input("email", sql.VarChar(100), usuario.email)
      .input("senha", sql.Int, usuario.quantidade)
      .query(
        "INSERT INTO tabelaUsuarios (nome, email, senha) OUTPUT INSERTED.* VALUES (@nome, @email ,@senha)",
      );

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro.message);
    throw erro;
  }
}

async function verificarNomeExistente(nome) {
  try {
    const conexao = await conectar();

    const resultado = await conexao
      .request()
      .input("nome", sql.VarChar(100), nome.trim())
      .query("SELECT ID FROM tabelaUsuarios WHERE nome = @nome");

    return resultado.recordset.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar nome:", erro.message);
    throw erro;
  }
}

async function buscarUsuarioPorId(id) {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .input("id", sql.Int, id)
      .query("select * from tabelaUsuarios where id = @id");

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao buscar produto por ID", erro.message);
    throw erro;
  }
}

async function atualizarUsuario(id, usuario) {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .input("id", sql.Int, id)
      .input("nome", sql.VarChar(100), usuario.nome.trim())
      .input("email", sql.Decimal(10, 2), usuario.email.trim())
      .input("senha", sql.Int, usuario.senha)
      .query(
        "update tabelaUsuarios set nome = @nome, email = @email, senha = @senha output inserted.* where id = @id",
      );

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao atualizar produto", erro.message);
    throw erro;
  }
}

async function verificarNomeDuplicado(nome, id) {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .input("id", sql.Int, id)
      .input("nome", sql.VarChar(100), nome.trim())
      .query("select id from tabelaUsuarios where nome = @nome and id <> @id");

    return resultado.recordset.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar nome duplicado:", erro.message);
    throw erro;
  }
}

async function deletarUsuario(id) {
  try {
    const conexao = await conectar();
    const resultado = await conexao
      .request()
      .input("id", sql.Int, id)
      .query("delete from tabelaUsuarios where id = @id");
    return resultado.rowsAffected[0]
  } catch (erro) {
    console.error("Erro ao deletar Usuário:", erro.message);
    throw erro;
  }
}

module.exports = {
  listarUsuarios,
  cadastrarUsuario,
  verificarNomeExistente,
  buscarUsuarioPorId,
  atualizarUsuario,
  verificarNomeDuplicado,
  deletarUsuario
};