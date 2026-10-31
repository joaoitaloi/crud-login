const express = require('express')
const router = express.Router()
const {buscarUsuarios, postProdutos, getprodutosPorId, putProdutos,deleteProdutos} = require('../controllers/acessoController')


router.get('/produtos', buscarUsuarios)
router.post('/produtos', postProdutos)
router.get('/produtos/:id', getprodutosPorId)
router.put('/produtos/:id', putProdutos)
router.delete('/produtos/:id', deleteProdutos)

module.exports = router