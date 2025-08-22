import dotenv from 'dotenv';
dotenv.config();

export const SecurityConfig = {
  // Configuración de contraseñas
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
  PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' || true,
  PASSWORD_REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' || true,
  PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS === 'true' || true,
  PASSWORD_REQUIRE_SPECIAL: process.env.PASSWORD_REQUIRE_SPECIAL === 'true' || true,
  
  // Configuración de intentos de login
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  ACCOUNT_LOCK_TIME: parseInt(process.env.ACCOUNT_LOCK_TIME) || 30 * 60 * 1000, // 30 minutos
  
  // Configuración de sesiones
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '8h',
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 8 * 60 * 60 * 1000, // 8 horas
  
  // Configuración de activación de cuentas
  ACTIVATION_TOKEN_EXPIRATION: parseInt(process.env.ACTIVATION_TOKEN_EXPIRATION) || 48 * 60 * 60 * 1000, // 48 horas
  
  // Configuración de reset de contraseñas
  PASSWORD_RESET_EXPIRATION: parseInt(process.env.PASSWORD_RESET_EXPIRATION) || 1 * 60 * 60 * 1000, // 1 hora
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < SecurityConfig.PASSWORD_MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${SecurityConfig.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  if (SecurityConfig.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (SecurityConfig.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (SecurityConfig.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  if (SecurityConfig.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
