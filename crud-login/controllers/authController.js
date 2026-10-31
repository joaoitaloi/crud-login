const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clienteModel = require('../models/clienteModel');
const validarCadastro = require('../utils/validarCadastro');
const crypto = require('crypto');
const enviarLinkRecuperacao = require('../utils/enviarLinkRecuperacao');

async function cadastrar(req, res) {
  const body = req.body || {};
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const senha = body.senha;
  const erros = validarCadastro({ nome, email, senha });

  if (erros.length) return res.status(400).json({ erros });

  try {
    if (await clienteModel.buscarPorEmail(email)) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const cliente = await clienteModel.cadastrar({ nome, email, senhaHash });
    return res.status(201).json({ mensagem: 'Cadastro concluído.', cliente });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro ao cadastrar cliente:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível concluir o cadastro.' });
  }
}

async function login(req, res) {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const senha = body.senha;

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(500).json({ mensagem: 'Configure JWT_SECRET no arquivo .env.' });
  }

  if (!email || typeof senha !== 'string') {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
  }

  try {
    const cliente = await clienteModel.buscarPorEmail(email);
    const senhaCorreta = cliente && await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { sub: String(cliente.id), email: cliente.email },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado.',
      token,
      tipo: 'Bearer',
      expiraEm: process.env.JWT_EXPIRES_IN || '1h',
      cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email }
    });
  } catch (erro) {
    console.error('Erro ao autenticar cliente:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível realizar o login.' });
  }
}

async function solicitarRecuperacao(req, res) {
  const body = req.body || {};
  const email = typeof body.email === 'string'
    ? body.email.trim().toLowerCase()
    : '';

  if (!email) {
    return res.status(400).json({ mensagem: 'Informe seu e-mail.' });
  }

  try {
    const cliente = await clienteModel.buscarPorEmail(email);

    if (cliente) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

      await clienteModel.salvarTokenRecuperacao(
        cliente.id,
        tokenHash,
        expiraEm
      );

      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const link = `${baseUrl}/redefinir-senha.html?token=${token}`;

      await enviarLinkRecuperacao(email, link);
    }

    return res.status(200).json({
      mensagem: 'Se esse e-mail estiver cadastrado, você receberá instruções para recuperar a senha.'
    });
  } catch (erro) {
    console.error('Erro ao solicitar recuperação:', erro.message);
    return res.status(500).json({
      mensagem: 'Não foi possível solicitar a recuperação agora.'
    });
  }
}

async function redefinirSenha(req, res) {
  const body = req.body || {};
  const { token, senha } = body;

  if (typeof token !== 'string' || !token) {
    return res.status(400).json({ mensagem: 'Link de recuperação inválido.' });
  }

  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 72) {
    return res.status(400).json({
      mensagem: 'A senha deve ter entre 8 e 72 caracteres.'
    });
  }

  try {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const senhaHash = await bcrypt.hash(senha, 12);

    const atualizado = await clienteModel.redefinirSenhaComToken(
      tokenHash,
      senhaHash
    );

    if (!atualizado) {
      return res.status(400).json({
        mensagem: 'Link inválido, expirado ou já utilizado.'
      });
    }

    return res.status(200).json({
      mensagem: 'Senha redefinida. Você já pode entrar com a nova senha.'
    });
  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro.message);
    return res.status(500).json({
      mensagem: 'Não foi possível redefinir a senha agora.'
    });
  }
}
module.exports = {
  cadastrar,
  login,
  solicitarRecuperacao,
  redefinirSenha
};
