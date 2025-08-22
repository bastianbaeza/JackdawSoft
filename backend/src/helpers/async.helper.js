// Wrapper para manejar errores async en Express 5
export const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper para aplicar async wrapper a múltiples middlewares
export const wrapAsync = (...middlewares) => {
  return middlewares.map(middleware => {
    if (typeof middleware === 'function') {
      return asyncWrapper(middleware);
    }
    return middleware;
  });
};
