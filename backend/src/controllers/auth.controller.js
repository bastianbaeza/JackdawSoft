import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { User, Roles, AccountStatus } from "../entity/User.js";
import { generateActivationToken } from "../services/token.service.js";
import { sendActivationEmail } from "../services/email.service.js";
import { logAction } from "../services/audit.service.js";
import { AuditActions } from "../entity/AuditLog.js";
import { SecurityConfig, validatePassword } from "../config/security.config.js";

const userRepo = () => AppDataSource.getRepository(User);

// Función para obtener IP del cliente
const getClientIP = (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Verificar que el rol es válido
    if (role && !Object.values(Roles).includes(role)) {
      return res.status(400).json({ mensaje: "Rol inválido" });
    }
    
    // Solo Superadmin puede asignar rol de Superadmin
    if (role === Roles.SUPERADMIN && req.user.role !== Roles.SUPERADMIN) {
      return res.status(403).json({ mensaje: "Solo el Superadministrador puede asignar este rol" });
    }
    
    const exists = await userRepo().findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ mensaje: "Ya existe un usuario con este email" });
    }
    
    const token = generateActivationToken();
    const activationExpires = new Date(Date.now() + SecurityConfig.ACTIVATION_TOKEN_EXPIRATION);
    
    // Generar contraseña temporal segura
    const tempPassword = await bcrypt.hash(token, 12);
    
    const user = userRepo().create({
      email,
      password: tempPassword,
      role: role || Roles.OPERATOR,
      status: AccountStatus.PENDING,
      activationToken: token,
      activationExpires,
      invitedBy: req.user.id,
    });
    
    await userRepo().save(user);
    
    // Enviar email de activación
    await sendActivationEmail(email, token);
    
    // Log de auditoría
    await logAction(
      req.user.id,
      AuditActions.USER_INVITED,
      user.id,
      { role: role || Roles.OPERATOR, email },
      req,
      email,
      req.user.email
    );
    
    return res.status(201).json({ 
      mensaje: "Invitación enviada exitosamente", 
      usuarioId: user.id,
      email: user.email,
      rol: user.role
    });
  } catch (err) {
    console.error('Error inviting user:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ mensaje: "Contraseña requerida" });
    }
    
    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        mensaje: "Contraseña no cumple los requisitos de seguridad",
        errores: passwordValidation.errors 
      });
    }
    
    const user = await userRepo().findOne({ where: { activationToken: token } });
    if (!user) {
      return res.status(400).json({ mensaje: "Token de activación inválido" });
    }
    
    if (user.activationExpires < new Date()) {
      return res.status(400).json({ mensaje: "Token de activación expirado" });
    }
    
    // Activar cuenta
    user.activationToken = null;
    user.activationExpires = null;
    user.status = AccountStatus.ACTIVE;
    user.password = await bcrypt.hash(password, 12);
    user.loginAttempts = 0;
    user.blockedUntil = null;
    
    await userRepo().save(user);
    
    // Log de auditoría
    await logAction(
      user.id,
      AuditActions.USER_ACTIVATED,
      user.id,
      { email: user.email },
      req,
      user.email,
      user.email
    );
    
    return res.json({ 
      mensaje: "Cuenta activada exitosamente",
      email: user.email 
    });
  } catch (err) {
    console.error('Error activating account:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ mensaje: "Email y contraseña requeridos" });
    }
    
    const user = await userRepo().findOne({ where: { email } });
    
    // Log intento de login fallido si el usuario no existe
    if (!user) {
      await logAction(
        null,
        AuditActions.LOGIN_FAILED,
        null,
        { email, reason: 'Usuario no encontrado' },
        req,
        email
      );
      return res.status(400).json({ mensaje: "Credenciales inválidas" });
    }
    
    // Verificar si la cuenta está bloqueada
    if (user.blockedUntil && user.blockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.blockedUntil - new Date()) / (1000 * 60));
      await logAction(
        user.id,
        AuditActions.LOGIN_FAILED,
        user.id,
        { email, reason: 'Cuenta bloqueada' },
        req,
        user.email,
        user.email
      );
      return res.status(423).json({ 
        mensaje: `Cuenta bloqueada. Intenta nuevamente en ${remainingTime} minutos` 
      });
    }
    
    // Verificar estado de la cuenta
    if (user.status !== AccountStatus.ACTIVE) {
      await logAction(
        user.id,
        AuditActions.LOGIN_FAILED,
        user.id,
        { email, reason: `Cuenta ${user.status}` },
        req,
        user.email,
        user.email
      );
      
      let message = "Cuenta inactiva";
      if (user.status === AccountStatus.PENDING) {
        message = "Cuenta pendiente de activación. Revisa tu email";
      } else if (user.status === AccountStatus.BLOCKED) {
        message = "Cuenta bloqueada. Contacta al administrador";
      }
      
      return res.status(403).json({ mensaje: message, estado: user.status });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Incrementar intentos de login
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Bloquear cuenta si se exceden los intentos
      if (user.loginAttempts >= SecurityConfig.MAX_LOGIN_ATTEMPTS) {
        user.blockedUntil = new Date(Date.now() + SecurityConfig.ACCOUNT_LOCK_TIME);
        user.status = AccountStatus.BLOCKED;
        
        await logAction(
          user.id,
          AuditActions.USER_BLOCKED,
          user.id,
          { email, reason: 'Demasiados intentos de login' },
          req,
          user.email,
          user.email
        );
      }
      
      await userRepo().save(user);
      
      await logAction(
        user.id,
        AuditActions.LOGIN_FAILED,
        user.id,
        { email, reason: 'Contraseña incorrecta', attempts: user.loginAttempts },
        req,
        user.email,
        user.email
      );
      
      return res.status(400).json({ 
        mensaje: "Credenciales inválidas",
        intentosRestantes: Math.max(0, SecurityConfig.MAX_LOGIN_ATTEMPTS - user.loginAttempts)
      });
    }
    
    // Login exitoso - resetear intentos
    user.loginAttempts = 0;
    user.blockedUntil = null;
    user.lastLogin = new Date();
    await userRepo().save(user);
    
    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        status: user.status
      }, 
      process.env.JWT_SECRET || "secret", 
      { expiresIn: SecurityConfig.JWT_EXPIRATION }
    );
    
    // Log login exitoso
    await logAction(
      user.id,
      AuditActions.LOGIN_SUCCESSFUL,
      user.id,
      { email },
      req,
      user.email,
      user.email
    );
    
    // Configurar cookie segura
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SecurityConfig.SESSION_TIMEOUT
    });
    
    return res.json({ 
      mensaje: "Login exitoso",
      usuario: {
        id: user.id,
        email: user.email,
        rol: user.role,
        estado: user.status,
        ultimoLogin: user.lastLogin
      },
      token 
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const logout = async (req, res) => {
  try {
    // Limpiar cookie
    res.clearCookie('authToken');
    
    // Log logout
    if (req.user) {
      await logAction(
        req.user.id,
        'logout',
        req.user.id,
        { email: req.user.email },
        req,
        req.user.email,
        req.user.email
      );
    }
    
    return res.json({ mensaje: "Logout exitoso" });
  } catch (err) {
    console.error('Error during logout:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const me = async (req, res) => {
  try {
    const { id, email, role, status, lastLogin } = req.user;
    res.json({ 
      id, 
      email, 
      rol: role, 
      estado: status, 
      ultimoLogin: lastLogin,
      permisos: getRolePermissions(role)
    });
  } catch (err) {
    console.error('Error getting user profile:', err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Función auxiliar para obtener permisos por rol
const getRolePermissions = (role) => {
  const permissions = {
    puedeGestionarUsuarios: false,
    puedeVerRegistrosAuditoria: false,
    puedeGestionarRoles: false,
    puedeVerTodosLosUsuarios: false,
    puedeDesactivarUsuarios: false,
  };
  
  switch (role) {
    case Roles.SUPERADMIN:
      permissions.puedeGestionarUsuarios = true;
      permissions.puedeVerRegistrosAuditoria = true;
      permissions.puedeGestionarRoles = true;
      permissions.puedeVerTodosLosUsuarios = true;
      permissions.puedeDesactivarUsuarios = true;
      break;
    case Roles.ADMIN:
      permissions.puedeVerTodosLosUsuarios = true;
      permissions.puedeVerRegistrosAuditoria = true;
      break;
    case Roles.OPERATOR:
    case Roles.SUPPORT:
    default:
      // Sin permisos especiales
      break;
  }
  
  return permissions;
};