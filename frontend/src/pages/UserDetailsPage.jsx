import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Calendar, Activity, Save, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: ''
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const userData = response.data.data;
      setUser(userData);
      setFormData({
        nombre: userData.nombre || '',
        email: userData.email || '',
        rol: userData.rol || ''
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast.error('Error al cargar los detalles del usuario');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${id}`, formData);
      toast.success('Usuario actualizado exitosamente');
      setEditing(false);
      loadUser();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadministrador':
        return 'bg-red-100 text-red-800';
      case 'administrador':
        return 'bg-blue-100 text-blue-800';
      case 'usuario':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'superadministrador':
        return 'Superadministrador';
      case 'administrador':
        return 'Administrador';
      case 'usuario':
        return 'Usuario';
      default:
        return role;
    }
  };

  const canEdit = () => {
    if (currentUser?.rol === 'superadministrador') return true;
    if (currentUser?.rol === 'administrador' && user?.rol !== 'superadministrador') return true;
    return currentUser?.id === user?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Usuario no encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          El usuario que buscas no existe o ha sido eliminado.
        </p>
        <button
          onClick={() => navigate('/users')}
          className="btn-primary"
        >
          Volver a usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="btn-icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {editing ? 'Editar Usuario' : 'Detalles del Usuario'}
          </h1>
          <p className="text-gray-600">
            {editing ? 'Modifica la información del usuario' : 'Información detallada del usuario'}
          </p>
        </div>
        {canEdit() && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {(currentUser?.rol === 'superadministrador' || 
                  (currentUser?.rol === 'administrador' && user?.rol !== 'superadministrador')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol del usuario
                    </label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {currentUser?.rol === 'superadministrador' && (
                        <option value="superadministrador">Superadministrador</option>
                      )}
                      <option value="administrador">Administrador</option>
                      <option value="usuario">Usuario</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        nombre: user.nombre || '',
                        email: user.email || '',
                        rol: user.rol || ''
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                      <p className="font-medium text-gray-900">{user.nombre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rol</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                        {getRoleLabel(user.rol)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de registro</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.fechaCreacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado del usuario */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado del Usuario
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Último acceso</span>
                <span className="text-sm text-gray-900">
                  {user.ultimoAcceso 
                    ? new Date(user.ultimoAcceso).toLocaleDateString('es-ES')
                    : 'Nunca'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <Activity className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Usuario creado</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.fechaCreacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
