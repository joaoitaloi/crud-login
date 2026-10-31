const jwt = require('jsonwebtoken');

function autenticarJWT(req, res, next) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(500).json({ mensagem: 'Configure JWT_SECRET no arquivo .env.' });
  }

  const authorization = req.get('authorization') || '';
  const [tipo, token] = authorization.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token de acesso não informado.' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticarJWT;
