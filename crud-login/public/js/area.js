const token = sessionStorage.getItem('token');
const mensagem = document.querySelector('#mensagem');
const perfilForm = document.querySelector('#perfil-form');

if (!token) {
  window.location.replace('/login.html');
} else {
  async function carregarPerfil() {
    try {
      const resposta = await fetch('/api/client/me', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.mensagem || 'Sessão inválida.');

      document.querySelector('#nome').textContent = resultado.cliente.nome;
      document.querySelector('#email').textContent = resultado.cliente.email;
      perfilForm.elements.nome.value = resultado.cliente.nome;
      perfilForm.elements.email.value = resultado.cliente.email;
    } catch (erro) {
      sessionStorage.removeItem('token');
      mensagem.textContent = erro.message;
      mensagem.classList.add('error');
      window.setTimeout(() => window.location.replace('/login.html'), 900);
    }
  }

  perfilForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagem.textContent = 'Salvando alterações...';
    mensagem.className = 'message';

    try {
      const resposta = await fetch('/api/client/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          nome: perfilForm.elements.nome.value,
          email: perfilForm.elements.email.value
        })
      });
      const resultado = resposta.status === 204 ? {} : await resposta.json();
      if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível atualizar.');

      document.querySelector('#nome').textContent = resultado.cliente.nome;
      document.querySelector('#email').textContent = resultado.cliente.email;
      mensagem.textContent = resultado.mensagem;
      mensagem.classList.add('success');
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.classList.add('error');
    }
  });

  document.querySelector('#excluir-conta').addEventListener('click', async () => {
    const confirmou = window.confirm('Tem certeza de que deseja excluir sua conta? Essa ação não pode ser desfeita.');
    if (!confirmou) return;

    const senha = window.prompt('Digite sua senha atual para confirmar a exclusão:');
    if (senha === null || !senha) return;

    try {
      const resposta = await fetch('/api/client/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ senha })
      });
      if (!resposta.ok) {
        const resultado = await resposta.json();
        throw new Error(resultado.mensagem || 'Não foi possível excluir a conta.');
      }

      sessionStorage.removeItem('token');
      window.location.replace('/login.html');
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.classList.add('error');
    }
  });

  document.querySelector('#sair').addEventListener('click', () => {
    sessionStorage.removeItem('token');
    window.location.replace('/login.html');
  });

  carregarPerfil();
}
