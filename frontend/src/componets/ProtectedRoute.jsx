import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles, requiredPermissions }) => {
  const { isAuthenticated, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requieren roles específicos
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: <span className="font-semibold">{user?.rol}</span>
          </p>
        </div>
      </div>
    );
  }

  // Si se requieren permisos específicos
  if (requiredPermissions && !requiredPermissions.some(permission => hasPermission(permission))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Permisos Insuficientes
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes los permisos necesarios para realizar esta acción.
          </p>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar el contenido
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
