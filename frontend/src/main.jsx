import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './global.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Suprimir advertencia de React DevTools en desarrollo
if (import.meta.env.DEV) {
  // Suprimir solo en desarrollo, no en producción
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes && args[0].includes('Download the React DevTools')) {
      return;
    }
    originalError(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
