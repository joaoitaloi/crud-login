const express = require('express');
const {
  cadastrar,
  login,
  solicitarRecuperacao,
  redefinirSenha
} = require('../controllers/authController');

const router = express.Router();

router.post('/cadastro', cadastrar);
router.post('/login', login);
router.post('/solicitar-recuperacao', solicitarRecuperacao);
router.post('/redefinir-senha', redefinirSenha);

module.exports = router;