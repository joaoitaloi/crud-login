const form = document.querySelector('#login-form');
const mensagem = document.querySelector('#mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensagem.textContent = 'Verificando seus dados...';
  mensagem.className = 'message';

  const dados = Object.fromEntries(new FormData(form));
  try {
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || resultado.erros?.join(' '));

    sessionStorage.setItem('token', resultado.token);
    window.location.assign('/area.html');
  } catch (erro) {
    mensagem.textContent = erro.message || 'Não foi possível entrar. Tente novamente.';
    mensagem.classList.add('error');
  }
});
