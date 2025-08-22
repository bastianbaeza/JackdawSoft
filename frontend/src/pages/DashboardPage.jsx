import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';

const DashboardPage = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isSuperAdmin()) {
          const response = await userService.getSystemStats();
          setStats(response);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isSuperAdmin]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'superadministrador':
        return 'text-purple-600 bg-purple-100';
      case 'administrador':
        return 'text-blue-600 bg-blue-100';
      case 'operador':
        return 'text-green-600 bg-green-100';
      case 'soporte':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'text-green-600 bg-green-100';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'bloqueado':
        return 'text-red-600 bg-red-100';
      case 'desactivado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido al sistema de gestión Jackdaws
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Último acceso: {formatDate(user?.ultimoLogin)}
          </p>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="ml-6 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.email}
            </h2>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user?.rol)}`}>
                {user?.rol}
              </span>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(user?.estado)}`}>
                {user?.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Cuenta creada: {formatDate(user?.fechaCreacion)}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas del sistema - Solo para Superadmin */}
      {isSuperAdmin() && (
        <>
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total de usuarios */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Usuarios
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.usuarios?.total || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usuarios activos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Usuarios Activos
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.usuarios?.activos || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usuarios pendientes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pendientes
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.usuarios?.pendientes || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usuarios bloqueados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Bloqueados
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.usuarios?.bloqueados || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Distribución por roles */}
          {stats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribución por Roles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.roles?.superAdministradores || 0}
                  </div>
                  <div className="text-sm text-gray-500">Superadmins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.roles?.administradores || 0}
                  </div>
                  <div className="text-sm text-gray-500">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.roles?.operadores || 0}
                  </div>
                  <div className="text-sm text-gray-500">Operadores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.roles?.soporte || 0}
                  </div>
                  <div className="text-sm text-gray-500">Soporte</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/profile"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Ver mi Perfil</p>
              <p className="text-sm text-blue-700">Información personal</p>
            </div>
          </a>

          {isAdmin() && (
            <a
              href="/users"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Gestionar Usuarios</p>
                <p className="text-sm text-green-700">Ver y administrar</p>
              </div>
            </a>
          )}

          {isSuperAdmin() && (
            <a
              href="/invite-user"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <UserPlus className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Invitar Usuario</p>
                <p className="text-sm text-purple-700">Crear nuevo usuario</p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Información del sistema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Sistema
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estado del Sistema:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              Operativo
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Versión:</span>
            <span className="text-gray-900">v1.0.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Última actualización:</span>
            <span className="text-gray-900">22 de agosto, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
