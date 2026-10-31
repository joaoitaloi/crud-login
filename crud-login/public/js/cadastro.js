const form = document.querySelector('#cadastro-form');
const mensagem = document.querySelector('#mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensagem.textContent = 'Criando sua conta...';
  mensagem.className = 'message';

  const dados = Object.fromEntries(new FormData(form));
  try {
    const resposta = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || resultado.erros?.join(' '));

    mensagem.textContent = 'Cadastro realizado. Redirecionando para o login...';
    mensagem.classList.add('success');
    form.reset();
    window.setTimeout(() => window.location.assign('/login.html'), 1200);
  } catch (erro) {
    mensagem.textContent = erro.message || 'Não foi possível concluir o cadastro.';
    mensagem.classList.add('error');
  }
});
