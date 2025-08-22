// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../componets/LoadingSpinner';
import { Eye, EyeOff, Shield } from 'lucide-react';
import '../styles/login.css';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('¡Bienvenido al sistema Jackdaws!');
    } catch (error) {
      const message = error.response?.data?.mensaje || 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'superadmin@jackdaws.local',
      password: 'SuperAdmin123!'
    });
  };

  return (
    <div 
      className="login-wrapper"
      style={{ backgroundImage: 'url(/images/jackdaws-background.png)' }}
    >
      <div className="overlay" />

      <div className="form-container">
        <div className="form-card group">
          <div className="glow-border" />
          <div className="glass-overlay" />
          <div className="form-inner">
            <div className="accent-bar" />
            <div className="header">
              <div className="icon-wrapper">
                <div className="icon-bg">
                  <Shield className="icon" />
                </div>
                <div className="pulse-indicator">
                  <span className="pulse-dot"></span>
                </div>
              </div>
              <h1 className="brand-title">Jackdaws</h1>
              <p className="subtitle">Sistema de Gestión Empresarial</p>
              <p className="subtext">Surreal & Creative Software</p>
            </div>

            <div className="mb-8">
              <h2 className="form-title">Acceso al Sistema</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative input-container email-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  disabled={isLoading}
                  className="input-field enhanced"
                />
                <div className="input-icon">
                  <svg className="icon-svg email-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>

              <div className="relative input-container password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  disabled={isLoading}
                  className="input-field enhanced password"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="toggle-password-inline"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" className="mr-2" />
                  Recuérdame
                </label>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isLoading}
                  className="link"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Acceder al Sistema'}
              </button>

              <div className="divider">
                <span className="divider-line" />
                <span className="divider-text">o</span>
                <span className="divider-line" />
              </div>

              <button
                type="button"
                onClick={fillDemoCredentials}
                className="btn-secondary"
                disabled={isLoading}
              >
                Usar credenciales de demo
              </button>
            </form>

            <footer className="footer">
              <p>© 2025 Jackdaws Software. Todos los derechos reservados.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
