import { body, param, validationResult } from 'express-validator';
import { handleValidationErrors } from './auth.validation.js';
import { validatePassword } from '../config/security.config.js';

export const validateRequestPasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  handleValidationErrors
];

export const validateResetTokenParam = [
  param('token')
    .isLength({ min: 64, max: 64 })
    .withMessage('Token inválido'),
  handleValidationErrors
];

export const validateResetPassword = [
  param('token')
    .isLength({ min: 64, max: 64 })
    .withMessage('Token inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  handleValidationErrors
];
