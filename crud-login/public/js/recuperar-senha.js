const form = document.querySelector('#recuperar-form');
const mensagem = document.querySelector('#mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensagem.textContent = 'Solicitando recuperação...';

  try {
    const resposta = await fetch('/api/auth/solicitar-recuperacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.value
      })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || 'Não foi possível solicitar.');
    }

    mensagem.textContent = resultado.mensagem;
    form.reset();
  } catch (erro) {
    mensagem.textContent = erro.message;
  }
});