import { logAction } from '../services/audit.service.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error crítico
  if (req.user && err.status >= 500) {
    logAction(
      req.user.id,
      'system_error',
      null,
      { 
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      },
      req,
      null,
      req.user.email
    ).catch(logErr => console.error('Error logging system error:', logErr));
  }
  
  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Errores de base de datos
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      message: 'Ya existe un registro con estos datos'
    });
  }
  
  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado'
    });
  }
  
  // Error por defecto
  const statusCode = err.status || err.statusCode || 500;
  const message = err.status < 500 ? err.message : 'Error interno del servidor';
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: 'Endpoint no encontrado',
    url: req.originalUrl,
    method: req.method
  });
};
