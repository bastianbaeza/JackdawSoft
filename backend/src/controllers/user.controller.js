import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import { User, Roles, AccountStatus } from "../entity/User.js";
import { logAction, getAuditLogs } from "../services/audit.service.js";
import { AuditActions } from "../entity/AuditLog.js";
import { validatePassword } from "../config/security.config.js";

const userRepo = () => AppDataSource.getRepository(User);

// Listar usuarios - Solo Superadmin y Admin pueden ver todos los usuarios
export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, search } = req.query;
    
    const queryBuilder = userRepo().createQueryBuilder('user');
    
    // Filtros opcionales
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    if (search) {
      queryBuilder.andWhere('user.email ILIKE :search', { search: `%${search}%` });
    }
    
    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');
    
    const [users, total] = await queryBuilder.getManyAndCount();
    
    // Ocultar información sensible
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      rol: user.role,
      estado: user.status,
      ultimoLogin: user.lastLogin,
      fechaCreacion: user.createdAt,
      fechaActualizacion: user.updatedAt,
      invitadoPor: user.invitedBy
    }));
    
    res.json({
      usuarios: sanitizedUsers,
      paginacion: {
        total,
        pagina: parseInt(page),
        limite: parseInt(limit),
        totalPaginas: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error listing users:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Obtener un usuario específico
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    // Los usuarios solo pueden ver su propio perfil (excepto Superadmin)
    if (req.user.role !== Roles.SUPERADMIN && req.user.id !== id) {
      return res.status(403).json({ mensaje: "Sin permisos para ver este usuario" });
    }
    
    // Sanitizar respuesta
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      rol: user.role,
      estado: user.status,
      ultimoLogin: user.lastLogin,
      fechaCreacion: user.createdAt,
      fechaActualizacion: user.updatedAt
    };
    
    // Solo Superadmin puede ver información adicional
    if (req.user.role === Roles.SUPERADMIN) {
      sanitizedUser.invitadoPor = user.invitedBy;
      sanitizedUser.intentosLogin = user.loginAttempts;
      sanitizedUser.bloqueadoHasta = user.blockedUntil;
    }
    
    res.json(sanitizedUser);
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Actualizar usuario - Solo Superadmin puede cambiar roles y estado
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, password } = req.body;
    
    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    const oldData = { role: user.role, status: user.status };
    const changes = {};
    
    // Solo Superadmin puede cambiar roles
    if (role && role !== user.role) {
      if (req.user.role !== Roles.SUPERADMIN) {
        return res.status(403).json({ mensaje: "Solo el Superadministrador puede cambiar roles" });
      }
      
      if (!Object.values(Roles).includes(role)) {
        return res.status(400).json({ mensaje: "Rol inválido" });
      }
      
      // Prevenir auto-degradación del último Superadmin
      if (user.role === Roles.SUPERADMIN && role !== Roles.SUPERADMIN) {
        const superAdminCount = await userRepo().count({ where: { role: Roles.SUPERADMIN, status: AccountStatus.ACTIVE } });
        if (superAdminCount <= 1) {
          return res.status(400).json({ mensaje: "No se puede degradar el último Superadministrador" });
        }
      }
      
      user.role = role;
      changes.role = { from: oldData.role, to: role };
    }
    
    // Solo Superadmin puede cambiar el estado de otros usuarios
    if (status && status !== user.status) {
      if (req.user.role !== Roles.SUPERADMIN) {
        return res.status(403).json({ mensaje: "Solo el Superadministrador puede cambiar el estado de usuarios" });
      }
      
      if (!Object.values(AccountStatus).includes(status)) {
        return res.status(400).json({ mensaje: "Estado inválido" });
      }
      
      // Prevenir auto-bloqueo del último Superadmin
      if (user.role === Roles.SUPERADMIN && status !== AccountStatus.ACTIVE) {
        const activeSuperAdmins = await userRepo().count({ 
          where: { role: Roles.SUPERADMIN, status: AccountStatus.ACTIVE } 
        });
        if (activeSuperAdmins <= 1) {
          return res.status(400).json({ mensaje: "No se puede desactivar el último Superadministrador" });
        }
      }
      
      user.status = status;
      changes.status = { from: oldData.status, to: status };
    }
    
    // Cambio de contraseña (solo el mismo usuario o Superadmin)
    if (password) {
      if (req.user.id !== id && req.user.role !== Roles.SUPERADMIN) {
        return res.status(403).json({ mensaje: "Solo puedes cambiar tu propia contraseña" });
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          mensaje: "Contraseña no cumple los requisitos de seguridad",
          errores: passwordValidation.errors 
        });
      }
      
      user.password = await bcrypt.hash(password, 12);
      user.loginAttempts = 0;
      user.blockedUntil = null;
      changes.password = true;
    }
    
    await userRepo().save(user);
    
    // Log de auditoría para cada cambio
    if (changes.role) {
      await logAction(
        req.user.id,
        AuditActions.ROLE_CHANGED,
        user.id,
        changes.role,
        req,
        user.email,
        req.user.email
      );
    }
    
    if (changes.status) {
      const action = changes.status.to === AccountStatus.BLOCKED ? 
                    AuditActions.USER_BLOCKED : AuditActions.USER_UPDATED;
      await logAction(
        req.user.id,
        action,
        user.id,
        changes.status,
        req,
        user.email,
        req.user.email
      );
    }
    
    if (changes.password) {
      await logAction(
        req.user.id,
        AuditActions.PASSWORD_CHANGED,
        user.id,
        { targetUser: user.email, changedBy: req.user.email },
        req,
        user.email,
        req.user.email
      );
    }
    
    res.json({ 
      mensaje: "Usuario actualizado exitosamente",
      cambios: Object.keys(changes)
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Desactivar usuario - Solo Superadmin
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    // Prevenir auto-desactivación del último Superadmin
    if (user.role === Roles.SUPERADMIN) {
      const activeSuperAdmins = await userRepo().count({ 
        where: { role: Roles.SUPERADMIN, status: AccountStatus.ACTIVE } 
      });
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({ mensaje: "No se puede desactivar el último Superadministrador" });
      }
    }
    
    const oldStatus = user.status;
    user.status = AccountStatus.DEACTIVATED;
    user.loginAttempts = 0;
    user.blockedUntil = null;
    
    await userRepo().save(user);
    
    await logAction(
      req.user.id,
      AuditActions.USER_DEACTIVATED,
      user.id,
      { 
        email: user.email, 
        previousStatus: oldStatus,
        reason: req.body.reason || 'Sin razón especificada'
      },
      req,
      user.email,
      req.user.email
    );
    
    res.json({ 
      mensaje: "Usuario desactivado exitosamente",
      usuarioId: user.id,
      email: user.email
    });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Reactivar usuario - Solo Superadmin
export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    if (user.status === AccountStatus.ACTIVE) {
      return res.status(400).json({ mensaje: "El usuario ya está activo" });
    }
    
    const oldStatus = user.status;
    user.status = AccountStatus.ACTIVE;
    user.loginAttempts = 0;
    user.blockedUntil = null;
    
    await userRepo().save(user);
    
    await logAction(
      req.user.id,
      'user_reactivated',
      user.id,
      { 
        email: user.email, 
        previousStatus: oldStatus,
        reason: req.body.reason || 'Sin razón especificada'
      },
      req,
      user.email,
      req.user.email
    );
    
    res.json({ 
      mensaje: "Usuario reactivado exitosamente",
      usuarioId: user.id,
      email: user.email
    });
  } catch (err) {
    console.error('Error reactivating user:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Obtener logs de auditoría - Solo Superadmin y Admin
export const getAuditLogsController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      actorId, 
      targetId, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const filters = {};
    
    if (action) filters.action = action;
    if (actorId) filters.actorId = actorId;
    if (targetId) filters.targetId = targetId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    
    const result = await getAuditLogs(filters, parseInt(page), parseInt(limit));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting audit logs:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Obtener estadísticas del sistema - Solo Superadmin
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      blockedUsers,
      superAdmins,
      admins,
      operators,
      support
    ] = await Promise.all([
      userRepo().count(),
      userRepo().count({ where: { status: AccountStatus.ACTIVE } }),
      userRepo().count({ where: { status: AccountStatus.PENDING } }),
      userRepo().count({ where: { status: AccountStatus.BLOCKED } }),
      userRepo().count({ where: { role: Roles.SUPERADMIN } }),
      userRepo().count({ where: { role: Roles.ADMIN } }),
      userRepo().count({ where: { role: Roles.OPERATOR } }),
      userRepo().count({ where: { role: Roles.SUPPORT } })
    ]);
    
    res.json({
      usuarios: {
        total: totalUsers,
        activos: activeUsers,
        pendientes: pendingUsers,
        bloqueados: blockedUsers
      },
      roles: {
        superAdministradores: superAdmins,
        administradores: admins,
        operadores: operators,
        soporte: support
      },
      fechaGeneracion: new Date()
    });
  } catch (err) {
    console.error('Error getting system stats:', err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};