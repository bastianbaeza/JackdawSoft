import { body, param, validationResult } from 'express-validator';
import { Roles, AccountStatus } from '../entity/User.js';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

export const validateUpdateUser = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
  body('role')
    .optional()
    .isIn(Object.values(Roles))
    .withMessage('Rol inválido'),
  body('status')
    .optional()
    .isIn(Object.values(AccountStatus))
    .withMessage('Estado de cuenta inválido'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  handleValidationErrors
];

export const validateDeactivateUser = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La razón no puede exceder 500 caracteres'),
  handleValidationErrors
];
