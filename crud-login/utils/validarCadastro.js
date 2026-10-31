function validarCadastro({ nome, email, senha }) {
  const erros = [];

  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    erros.push('Informe um e-mail válido.');
  }
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 72) {
    erros.push('A senha deve ter entre 8 e 72 caracteres.');
  }

  return erros;
}

module.exports = validarCadastro;
