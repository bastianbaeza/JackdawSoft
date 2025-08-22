import { Router } from "express";
import { inviteUser, activateAccount, login, logout, me } from "../controllers/auth.controller.js";
import { 
  authenticate, 
  requireActiveAccount, 
  requireSuperAdmin 
} from "../middlewares/auth.middleware.js";
import { validateInviteUser, validateActivateAccount, validateLogin } from "../validations/auth.validation.js";
import { checkStatus } from "../controllers/status.controller.js";

const router = Router();

// Ruta de estado del sistema (pública)
router.get("/status", checkStatus);

// Rutas públicas
router.post("/login", validateLogin, login);
router.post("/activate/:token", validateActivateAccount, activateAccount);

// Rutas protegidas
router.use(authenticate, requireActiveAccount);

router.get("/me", me);
router.post("/logout", logout);

// Solo Superadmin puede invitar usuarios
router.post("/invite", requireSuperAdmin, validateInviteUser, inviteUser);

export default router;