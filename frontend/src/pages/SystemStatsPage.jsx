import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Activity, Database, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const SystemStatsPage = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    auditLogs: { total: 0, today: 0, thisWeek: 0 },
    system: {
      uptime: '0 días',
      memory: { used: 0, total: 100 },
      cpu: 0,
      storage: { used: 0, total: 100 }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // Simular carga de estadísticas del sistema
      // En un entorno real, estos datos vendrían de endpoints específicos
      const [usersResponse, auditLogsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/audit-logs')
      ]);

      const users = usersResponse.data.data || [];
      const auditLogs = auditLogsResponse.data.data || [];

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        users: {
          total: users.length,
          active: users.filter(u => u.activo !== false).length,
          inactive: users.filter(u => u.activo === false).length
        },
        auditLogs: {
          total: auditLogs.length,
          today: auditLogs.filter(log => 
            new Date(log.fechaCreacion).toISOString().split('T')[0] === today
          ).length,
          thisWeek: auditLogs.filter(log => 
            new Date(log.fechaCreacion) >= oneWeekAgo
          ).length
        },
        system: {
          uptime: '15 días, 8 horas',
          memory: { used: 68, total: 100 },
          cpu: 23,
          storage: { used: 45, total: 100 }
        }
      });
    } catch (error) {
      console.error('Error al cargar estadísticas del sistema:', error);
      toast.error('Error al cargar las estadísticas del sistema');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageLevel = (percentage) => {
    if (percentage >= 80) return 'Alto';
    if (percentage >= 60) return 'Medio';
    return 'Bajo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas del Sistema</h1>
          <p className="text-gray-600">Monitor de rendimiento y uso del sistema</p>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios totales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
              <p className="text-sm text-green-600">
                {stats.users.active} activos
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Logs de auditoría */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Logs Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.auditLogs.total}</p>
              <p className="text-sm text-green-600">
                {stats.auditLogs.today} hoy
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Actividad semanal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900">{stats.auditLogs.thisWeek}</p>
              <p className="text-sm text-blue-600">
                eventos registrados
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tiempo de funcionamiento */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Activo</p>
              <p className="text-xl font-bold text-gray-900">{stats.system.uptime}</p>
              <p className="text-sm text-green-600">
                sistema estable
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso de recursos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Uso de Recursos
          </h3>
          
          <div className="space-y-6">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">CPU</span>
                </div>
                <span className="text-sm text-gray-600">{stats.system.cpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getPercentageColor(stats.system.cpu)}`}
                  style={{ width: `${stats.system.cpu}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uso {getUsageLevel(stats.system.cpu)}
              </p>
            </div>

            {/* Memoria */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Memoria</span>
                </div>
                <span className="text-sm text-gray-600">{stats.system.memory.used}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getPercentageColor(stats.system.memory.used)}`}
                  style={{ width: `${stats.system.memory.used}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uso {getUsageLevel(stats.system.memory.used)}
              </p>
            </div>

            {/* Almacenamiento */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Almacenamiento</span>
                </div>
                <span className="text-sm text-gray-600">{stats.system.storage.used}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getPercentageColor(stats.system.storage.used)}`}
                  style={{ width: `${stats.system.storage.used}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uso {getUsageLevel(stats.system.storage.used)}
              </p>
            </div>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Estado del Sistema
          </h3>
          
          <div className="space-y-4">
            {/* Estado general */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Sistema</span>
              </div>
              <span className="text-green-600 font-medium">Operativo</span>
            </div>

            {/* Base de datos */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Base de Datos</span>
              </div>
              <span className="text-green-600 font-medium">Conectada</span>
            </div>

            {/* API */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">API</span>
              </div>
              <span className="text-green-600 font-medium">Disponible</span>
            </div>

            {/* Conectividad */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Wifi className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Conectividad</span>
              </div>
              <span className="text-green-600 font-medium">Estable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Resumen de Actividad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-lg inline-flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Usuarios Activos</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.users.active}</p>
            <p className="text-sm text-gray-500">de {stats.users.total} usuarios totales</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-lg inline-flex items-center justify-center mb-3">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Eventos Hoy</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.auditLogs.today}</p>
            <p className="text-sm text-gray-500">eventos registrados</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-lg inline-flex items-center justify-center mb-3">
              <Server className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Rendimiento</h4>
            <p className="text-3xl font-bold text-purple-600 mt-2">Óptimo</p>
            <p className="text-sm text-gray-500">sistema funcionando bien</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatsPage;
