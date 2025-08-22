import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, User, Shield, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const InviteUserPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'usuario'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.rol) {
      newErrors.rol = 'Debes seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        password: 'temporal123' // Password temporal que el usuario debe cambiar
      };

      await api.post('/auth/register', userData);
      
      toast.success(`Usuario ${formData.nombre} creado exitosamente`);
      navigate('/users');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al crear el usuario');
      }
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'superadministrador':
        return 'Acceso completo al sistema y gestión de todos los usuarios';
      case 'administrador':
        return 'Puede gestionar usuarios y acceder a funciones administrativas';
      case 'usuario':
        return 'Acceso básico al sistema con permisos limitados';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="btn-icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
            <p className="text-gray-600">Invita a un nuevo usuario al sistema</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Usuario
            </h3>
            
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.nombre ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Ingrese el nombre completo"
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rol del usuario */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rol y Permisos
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol del usuario *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.rol ? 'border-red-300 focus:border-red-500' : ''}`}
                >
                  <option value="">Seleccionar rol</option>
                  {user?.rol === 'superadministrador' && (
                    <option value="superadministrador">Superadministrador</option>
                  )}
                  <option value="administrador">Administrador</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>
              {errors.rol && (
                <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
              )}
              {formData.rol && (
                <p className="mt-2 text-sm text-gray-600">
                  {getRoleDescription(formData.rol)}
                </p>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Información importante
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El usuario recibirá un email con sus credenciales</li>
              <li>• La contraseña temporal será: <strong>temporal123</strong></li>
              <li>• Se requerirá cambiar la contraseña en el primer acceso</li>
              <li>• El usuario podrá acceder inmediatamente después de la creación</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Crear Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Vista previa del usuario */}
      {(formData.nombre || formData.email) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vista Previa del Usuario
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-medium text-primary-600">
                  {formData.nombre.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {formData.nombre || 'Nombre del usuario'}
              </h4>
              <p className="text-gray-600">
                {formData.email || 'email@ejemplo.com'}
              </p>
              {formData.rol && (
                <span className="inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {formData.rol === 'superadministrador' ? 'Superadministrador' :
                   formData.rol === 'administrador' ? 'Administrador' : 'Usuario'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteUserPage;
