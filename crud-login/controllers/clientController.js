const bcrypt = require('bcryptjs');
const clienteModel = require('../models/clienteModel');

function obterIdAutenticado(req) {
  const id = Number(req.usuario && req.usuario.sub);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function meuPerfil(req, res) {
  const id = obterIdAutenticado(req);
  if (!id) return res.status(401).json({ mensagem: 'Token inválido.' });

  try {
    const cliente = await clienteModel.buscarDadosPublicosPorId(id);
    if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    return res.status(200).json({ cliente });
  } catch (erro) {
    console.error('Erro ao consultar perfil:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível carregar o perfil.' });
  }
}

async function atualizarMeuPerfil(req, res) {
  const id = obterIdAutenticado(req);
  if (!id) return res.status(401).json({ mensagem: 'Token inválido.' });

  const body = req.body || {};
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const email = typeof body.email === 'string'
    ? body.email.trim().toLowerCase()
    : '';

  if (nome.length < 2 || nome.length > 100) {
    return res.status(400).json({ mensagem: 'O nome deve ter entre 2 e 100 caracteres.' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  try {
    const cliente = await clienteModel.atualizarDados(id, { nome, email });
    if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    return res.status(200).json({ mensagem: 'Dados atualizados.', cliente });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro ao atualizar perfil:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível atualizar os dados.' });
  }
}

async function excluirMinhaConta(req, res) {
  const id = obterIdAutenticado(req);
  if (!id) return res.status(401).json({ mensagem: 'Token inválido.' });

  const body = req.body || {};
  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!senha) return res.status(400).json({ mensagem: 'Informe sua senha para excluir a conta.' });

  try {
    const credenciais = await clienteModel.buscarCredenciaisPorId(id);
    if (!credenciais) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });

    const senhaCorreta = await bcrypt.compare(senha, credenciais.senha_hash);
    if (!senhaCorreta) return res.status(401).json({ mensagem: 'Senha incorreta.' });

    const excluida = await clienteModel.excluirConta(id);
    if (!excluida) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    return res.status(204).send();
  } catch (erro) {
    console.error('Erro ao excluir conta:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível excluir a conta.' });
  }
}

module.exports = { meuPerfil, atualizarMeuPerfil, excluirMinhaConta };
