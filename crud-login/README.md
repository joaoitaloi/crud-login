# Sistema de cadastro, login e clientes

Aplicação de estudo com Express, MySQL, bcrypt e JWT. O cadastro cria clientes; o login emite um JWT; a área autenticada permite consultar, atualizar e excluir a própria conta. A recuperação usa token temporário e, em desenvolvimento, mostra o link no terminal.

## Preparar para testar

1. No MySQL Workbench, crie ou selecione o banco `usuarios`.
2. Abra `sql/schema.sql` no editor SQL do Workbench, confirme que `usuarios` está selecionado como schema padrão e execute o script pelo ícone de raio. Ele cria `clientes` e `password_reset_tokens`.
3. Na pasta do projeto, copie `.env.example` para `.env` (no PowerShell: `Copy-Item .env.example .env`) e informe host, banco, usuário e senha usados na conexão do MySQL Workbench. Para a conexão local mostrada, use `DB_NAME=usuarios` e normalmente `DB_PORT=3306`.
4. Troque `JWT_SECRET` por uma chave aleatória com pelo menos 32 caracteres. Mantenha `RESET_EMAIL_MODE=console` para o teste local.
5. Execute:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A conexão com o MySQL é necessária para cadastro, login, perfil e recuperação.

## Funcionalidades

- Cadastro de cliente com validação de nome, e-mail e senha; senha armazenada com bcrypt.
- Login por e-mail e senha; emissão de JWT.
- Área do cliente protegida, com consulta, atualização de nome/e-mail e exclusão da própria conta.
- Recuperação de senha com token aleatório, armazenado como hash, validade de 15 minutos e uso único.
- Para testar recuperação local: solicite o link em `Esqueceu a senha?` e copie do terminal do servidor o link exibido. Não use o modo `console` em produção.

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/cadastro` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/solicitar-recuperacao` | Público |
| POST | `/api/auth/redefinir-senha` | Público, exige token temporário |
| GET | `/api/client/me` | JWT obrigatório |
| PUT | `/api/client/me` | JWT obrigatório |
| DELETE | `/api/client/me` | JWT obrigatório |

Para as rotas `/api/client/me`, envie o cabeçalho `Authorization: Bearer SEU_TOKEN`.

## Envio real de e-mail

Para sair do teste local, configure `RESET_EMAIL_MODE=smtp` e preencha `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` no `.env`. Use HTTPS em produção e nunca publique o `.env`.
