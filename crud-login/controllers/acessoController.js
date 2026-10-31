const {
  listarUsuarios,
  cadastrarUsuario,
  verificarNomeExistente,
  buscarProdutoPorId,
  atualizarProduto,
  verificarNomeDuplicado,
  deletarProduto,
} = require("../models/produtoModel");
const { validarProduto } = require("../utils/validarProduto");
const validarId = require("../utils/ValidarID");

async function buscarUsuarios(req, res) {
  try {
    const produtos = await listarUsuarios();

    return res.status(200).json(produtos);
  } catch (erro) {
    console.error("ERRO no Controller", erro.message);

    return res.status(500).json({
      mensagem: "ERRO interno ao buscar produtos",
    });
  }
}

async function postProdutos(req, res) {
  try {
    const produto = req.body;
    const erros = validarProduto(produto);

    if (erros.length > 0) {
      return res.status(400).json({
        erros,
      });
    }
    produto.nome = produto.nome.trim();

    const existente = await verificarNomeExistente(produto.nome);

    if (existente) {
      return res.status(409).json({
        erro: "Produto já cadastrado",
      });
    }

    const resultado = await cadastrarUsuario(produto);

    return res.status(201).json(resultado);
  } catch (erro) {
    console.error("Erro no POST", erro.message);

    if (erro.number === 2627 || erro.number === 2601) {
      return res.status(409).json({
        erro: "Produto já cadastrado",
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar produto",
    });
  }
}

async function getprodutosPorId(req, res) {
  try {
    const id = Number(req.params.id);
    const erro = validarId(id);

    if (erro) {
      return res.status(400).json({
        erro: erro,
      });
    }

    const produto = await buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    return res.status(200).json(produto);
  } catch (erro) {
    console.error("Erro no get por ID", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar produto",
    });
  }
}

async function putProdutos(req, res) {
  try {
    const id = Number(req.params.id);
    const erroid = validarId(id);

    if (erroid) {
      return res.status(400).json({
        erro: erroid,
      });
    }

    const produto = req.body;
    const erros = validarProduto(produto);

    if (erros.length > 0) {
      return res.status(400).json({
        erros,
      });
    }

    const produtoExistente = await buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    produto.nome = produto.nome.trim();

    const duplicado = await verificarNomeDuplicado(produto.nome, id);

    if (duplicado) {
      return res.status(409).json({
        erro: "Já existe outro produto com esse nome",
      });
    }

    const resultado = await atualizarProduto(id, produto);

    if (!resultado) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }
    return res.status(200).json(resultado);
  } catch (erro) {
    console.error("Erro no PUT:", erro.message);

    if (erro.number === 2627 || erro.number === 2601) {
      return res.status(409).json({
        erro: "Produto já cadastrado",
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar produto",
    });
  }
}

async function deleteUsuarios (req, res) {
  try {
    const id = Number(req.params.id);
    const erro = validarId(id);

    if (erro) {
      return res.status(400).json({
        erro: erro,
      });
    }

    const resultado = await deletarUsuario(id);

    if (!resultado) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }
    return res.status(200).json({
        mensagem: "Produto excluído com sucesso"
    });
  } catch (erro) {
    console.error("Erro no DELETE:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao excluir produto",
    });
  }
}

module.exports = {
  buscaUsuarios,
  postProdutos,
  getprodutosPorId,
  putProdutos,
  deleteUsuarios
};