import { rateLimit } from 'express-rate-limit';

// Configuración general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiadas solicitudes, por favor intenta más tarde.'
  }
});

// Configuración para rutas de autenticación (login, activate, request-reset, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 solicitudes por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiados intentos de autenticación, por favor intenta más tarde.'
  }
});

// Configuración para APIs que no deberían llamarse frecuentemente
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // Límite de 50 solicitudes por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Límite de API excedido, por favor intenta más tarde.'
  }
});

export { generalLimiter, authLimiter, apiLimiter };
