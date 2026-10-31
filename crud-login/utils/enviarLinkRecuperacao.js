const nodemailer = require('nodemailer');

async function enviarLinkRecuperacao(email, link) {
  // Modo local: mostra o link no terminal do servidor.
  if (process.env.RESET_EMAIL_MODE === 'console') {
    console.log(`Link de recuperação para ${email}:`);
    console.log(link);
    return;
  }

  const obrigatorias = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const faltando = obrigatorias.filter((chave) => !process.env[chave]);
  if (faltando.length) {
    throw new Error('Configure as variáveis SMTP no .env ou use RESET_EMAIL_MODE=console.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Recuperação de senha',
    text: `Acesse este link para redefinir sua senha. Ele expira em 15 minutos:\n\n${link}`
  });
}

module.exports = enviarLinkRecuperacao;
