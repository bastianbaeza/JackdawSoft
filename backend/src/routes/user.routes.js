import { Router } from "express";
import { 
  listUsers, 
  getUser, 
  updateUser, 
  deactivateUser, 
  reactivateUser,
  getAuditLogsController,
  getSystemStats
} from "../controllers/user.controller.js";
import { 
  authenticate, 
  requireActiveAccount, 
  requireSuperAdmin, 
  requireAdmin,
  allowSelfOrSuperAdmin,
  preventSelfEscalation
} from "../middlewares/auth.middleware.js";
import { 
  validateUpdateUser, 
  validateDeactivateUser 
} from "../validations/user.validations.js";

const router = Router();

// Aplicar autenticación y verificar cuenta activa a todas las rutas
router.use(authenticate, requireActiveAccount);

// Rutas que requieren permisos de Admin o superior
router.get("/", requireAdmin, listUsers);
router.get("/audit-logs", requireAdmin, getAuditLogsController);

// Rutas que solo puede usar Superadmin
router.get("/system/stats", requireSuperAdmin, getSystemStats);
router.delete("/:id", requireSuperAdmin, validateDeactivateUser, deactivateUser);
router.patch("/:id/reactivate", requireSuperAdmin, reactivateUser);

// Rutas que permiten auto-gestión o Superadmin
router.get("/:id", allowSelfOrSuperAdmin, getUser);
router.patch("/:id", allowSelfOrSuperAdmin, preventSelfEscalation, validateUpdateUser, updateUser);

export default router;