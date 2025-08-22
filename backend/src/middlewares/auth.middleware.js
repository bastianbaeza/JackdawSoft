import passport from "passport";
import { Roles, AccountStatus } from "../entity/User.js";

export const authenticate = passport.authenticate("jwt", { session: false });

// Middleware para verificar que la cuenta esté activa
export const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }
  
  if (req.user.status !== AccountStatus.ACTIVE) {
    return res.status(403).json({ 
      mensaje: "Cuenta inactiva. Contacte al administrador.",
      estado: req.user.status 
    });
  }
  
  next();
};

// Middleware de autorización basado en roles
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      mensaje: "Sin permisos para esta operación",
      rolesRequeridos: allowedRoles,
      rolUsuario: req.user.role
    });
  }
  
  next();
};

// Middleware específico para operaciones que SOLO puede hacer el Superadministrador
export const requireSuperAdmin = authorize(Roles.SUPERADMIN);

// Middleware para operaciones de administración (Superadmin + Admin)
export const requireAdmin = authorize(Roles.SUPERADMIN, Roles.ADMIN);

// Middleware que permite al usuario modificar solo su propio perfil (excepto Superadmin)
export const allowSelfOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }
  
  const targetUserId = req.params.id || req.body.id;
  
  // El Superadmin puede modificar cualquier usuario
  if (req.user.role === Roles.SUPERADMIN) {
    return next();
  }
  
  // Los demás usuarios solo pueden modificar su propio perfil
  if (req.user.id === targetUserId) {
    return next();
  }
  
  return res.status(403).json({ 
    mensaje: "Solo puedes modificar tu propio perfil" 
  });
};

// Middleware para validar que no se esté intentando automodificar roles críticos
export const preventSelfEscalation = (req, res, next) => {
  const { role } = req.body;
  
  // Si no se está modificando el rol, continuar
  if (!role) {
    return next();
  }
  
  const targetUserId = req.params.id;
  
  // Prevenir que un usuario se asigne a sí mismo el rol de Superadmin
  if (req.user.id === targetUserId && role === Roles.SUPERADMIN) {
    return res.status(403).json({ 
      mensaje: "No puedes asignarte el rol de Superadministrador" 
    });
  }
  
  // Solo el Superadmin puede asignar el rol de Superadmin
  if (role === Roles.SUPERADMIN && req.user.role !== Roles.SUPERADMIN) {
    return res.status(403).json({ 
      mensaje: "Solo el Superadministrador puede asignar este rol" 
    });
  }
  
  next();
};