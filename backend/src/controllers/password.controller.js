import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import { User, AccountStatus } from "../entity/User.js";
import { SecurityConfig } from "../config/security.config.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import { logAction } from "../services/audit.service.js";
import { AuditActions } from "../entity/AuditLog.js";
import crypto from "crypto";

const userRepo = () => AppDataSource.getRepository(User);

/**
 * Solicitar un reset de contraseña
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Buscar usuario por email
    const user = await userRepo().findOne({ where: { email } });
    
    // No revelar si el email existe o no por seguridad
    if (!user) {
      return res.status(200).json({ 
        mensaje: "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña" 
      });
    }
    
    // Verificar si la cuenta está activa
    if (user.status !== AccountStatus.ACTIVE) {
      // Aún así enviamos respuesta exitosa para no revelar información
      return res.status(200).json({ 
        mensaje: "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña" 
      });
    }
    
    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + SecurityConfig.PASSWORD_RESET_EXPIRATION);
    
    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await userRepo().save(user);
    
    // Enviar email con instrucciones
    await sendPasswordResetEmail(user.email, resetToken);
    
    // Log de auditoría
    await logAction(
      user.id,
      AuditActions.PASSWORD_RESET_REQUESTED,
      user.id,
      { email: user.email },
      req,
      user.email,
      user.email
    );
    
    return res.status(200).json({ 
      mensaje: "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña" 
    });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

/**
 * Validar token de reset de contraseña
 */
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await userRepo().findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: AppDataSource.manager.getRepository(User)
          .createQueryBuilder()
          .where("resetPasswordExpires > :now", { now: new Date() })
          .getQuery()
      } 
    });
    
    if (!user) {
      return res.status(400).json({ 
        mensaje: "Token inválido o expirado" 
      });
    }
    
    return res.status(200).json({ 
      mensaje: "Token válido",
      email: user.email
    });
  } catch (err) {
    console.error('Error validating reset token:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

/**
 * Reset de contraseña con token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await userRepo().findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: AppDataSource.manager.getRepository(User)
          .createQueryBuilder()
          .where("resetPasswordExpires > :now", { now: new Date() })
          .getQuery()
      } 
    });
    
    if (!user) {
      return res.status(400).json({ 
        mensaje: "Token inválido o expirado" 
      });
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Actualizar usuario
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.loginAttempts = 0;
    user.blockedUntil = null;
    
    // Si la cuenta estaba bloqueada por intentos fallidos, reactivarla
    if (user.status === AccountStatus.BLOCKED) {
      user.status = AccountStatus.ACTIVE;
    }
    
    await userRepo().save(user);
    
    // Log de auditoría
    await logAction(
      user.id,
      AuditActions.PASSWORD_CHANGED,
      user.id,
      { email: user.email, method: 'reset' },
      req,
      user.email,
      user.email
    );
    
    return res.status(200).json({ 
      mensaje: "Contraseña actualizada con éxito" 
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
