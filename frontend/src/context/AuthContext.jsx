import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Verificar que el token siga siendo válido
          try {
            const profile = await authService.getProfile();
            setUser(profile);
          } catch (error) {
            // Token inválido, limpiar datos
            logout();
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.usuario);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  const updateUserProfile = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para verificar permisos
  const hasPermission = (permission) => {
    if (!user || !user.permisos) return false;
    return user.permisos[permission] === true;
  };

  // Función para verificar roles
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.rol === roles;
    }
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return false;
  };

  // Verificar si es superadministrador
  const isSuperAdmin = () => {
    return user?.rol === 'superadministrador';
  };

  // Verificar si es administrador o superior
  const isAdmin = () => {
    return hasRole(['superadministrador', 'administrador']);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUserProfile,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
