const express = require('express');
const autenticarJWT = require('../middleware/autenticarJWT');
const {
  meuPerfil,
  atualizarMeuPerfil,
  excluirMinhaConta
} = require('../controllers/clientController');

const router = express.Router();

router.get('/me', autenticarJWT, meuPerfil);
router.put('/me', autenticarJWT, atualizarMeuPerfil);
router.delete('/me', autenticarJWT, excluirMinhaConta);

module.exports = router;
