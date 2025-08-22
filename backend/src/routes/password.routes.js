import { Router } from "express";
import { 
  requestPasswordReset, 
  resetPassword,
  validateResetToken
} from "../controllers/password.controller.js";
import { 
  validateRequestPasswordReset,
  validateResetPassword,
  validateResetTokenParam
} from "../validations/password.validation.js";

const router = Router();

// Ruta para solicitar un reset de contraseña
router.post("/request-reset", validateRequestPasswordReset, requestPasswordReset);

// Ruta para verificar si un token de reset es válido
router.get("/validate-token/:token", validateResetTokenParam, validateResetToken);

// Ruta para resetear la contraseña con token
router.post("/reset/:token", validateResetPassword, resetPassword);

export default router;
