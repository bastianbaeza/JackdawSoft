import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Home,
  Users,
  UserPlus,
  FileText,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Shield
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Menú de navegación
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Mi Perfil',
      href: '/profile',
      icon: User,
      show: true
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      show: isAdmin()
    },
    {
      name: 'Invitar Usuario',
      href: '/invite-user',
      icon: UserPlus,
      show: isSuperAdmin()
    },
    {
      name: 'Auditoría',
      href: '/audit-logs',
      icon: FileText,
      show: isAdmin()
    },
    {
      name: 'Estadísticas',
      href: '/system-stats',
      icon: BarChart3,
      show: isSuperAdmin()
    }
  ].filter(item => item.show);

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'superadministrador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'administrador':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'operador':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'soporte':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center ml-2 md:ml-0">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    Jackdaws
                  </h1>
                  <p className="text-xs text-gray-500">
                    Sistema de Gestión
                  </p>
                </div>
              </div>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user?.rol)}`}>
                  {user?.rol}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <nav className="hidden md:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Sidebar móvil */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={toggleMobileMenu} />
            <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto">
              <div className="flex items-center mb-8">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-bold text-gray-900">Jackdaws</span>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {user?.email}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user?.rol)}`}>
                  {user?.rol}
                </span>
              </div>
              
              <ul className="space-y-2 flex-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.href);
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
