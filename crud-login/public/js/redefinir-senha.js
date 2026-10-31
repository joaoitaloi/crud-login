const form = document.querySelector('#redefinir-form');
const mensagem = document.querySelector('#mensagem');
const token = new URLSearchParams(window.location.search).get('token');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const senha = document.querySelector('#senha').value;
  const confirmarSenha = document.querySelector('#confirmar-senha').value;

  if (!token) {
    mensagem.textContent = 'O link está inválido ou incompleto.';
    return;
  }

  if (senha !== confirmarSenha) {
    mensagem.textContent = 'As senhas não coincidem.';
    return;
  }

  try {
    const resposta = await fetch('/api/auth/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senha })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || 'Não foi possível redefinir.');
    }

    mensagem.textContent = resultado.mensagem;
    form.reset();

    setTimeout(() => {
      window.location.href = './login.html';
    }, 1500);
  } catch (erro) {
    mensagem.textContent = erro.message;
  }
});