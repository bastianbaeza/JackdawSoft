import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Componentes
import Layout from './componets/Layout';
import ProtectedRoute from './componets/ProtectedRoute';
import LoadingSpinner from './componets/LoadingSpinner';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import InviteUserPage from './pages/InviteUserPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';
import SystemStatsPage from './pages/SystemStatsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { loading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <LoginPage />
        } 
      />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Gestión de usuarios - Solo admins */}
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="invite-user" element={<InviteUserPage />} />
          
          {/* Auditoría - Solo admins */}
          <Route path="audit-logs" element={<AuditLogsPage />} />
          
          {/* Estadísticas del sistema - Solo superadmin */}
          <Route path="system-stats" element={<SystemStatsPage />} />
        </Route>
      </Route>
      
      {/* Ruta por defecto - Redirigir a login si no está autenticado */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? 
          <NotFoundPage /> : 
          <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}

export default App;
