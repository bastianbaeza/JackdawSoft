import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <FileQuestion className="h-10 w-10 text-primary-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            La página que buscas no existe o ha sido movida. 
            Verifica la URL o regresa a la página principal.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Página Anterior
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
