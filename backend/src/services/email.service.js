import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

export const sendActivationEmail = async (email, token) => {
  const activationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/activate/${token}`;
  const message = {
    from: process.env.SMTP_FROM || "no-reply@example.com",
    to: email,
    subject: "Account Activation",
    text: `Activate your account: ${activationLink}`,
  };
  try {
    await transporter.sendMail(message);
  } catch (err) {
    console.error("Error sending email", err);
  }
  console.log(`Activation link for ${email}: ${activationLink}`);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
  const message = {
    from: process.env.SMTP_FROM || "no-reply@example.com",
    to: email,
    subject: "Restablecer contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Restablecer contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p><a href="${resetLink}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer contraseña</a></p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p>${resetLink}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste cambiar tu contraseña, puedes ignorar este mensaje.</p>
        <p>Gracias,<br>El equipo de Jackdaws</p>
      </div>
    `,
    text: `Restablecer contraseña\n\nHas solicitado restablecer tu contraseña.\n\nUtiliza el siguiente enlace para crear una nueva contraseña:\n${resetLink}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste cambiar tu contraseña, puedes ignorar este mensaje.\n\nGracias,\nEl equipo de Jackdaws`,
  };
  try {
    await transporter.sendMail(message);
  } catch (err) {
    console.error("Error sending password reset email", err);
  }
  console.log(`Password reset link for ${email}: ${resetLink}`);
};