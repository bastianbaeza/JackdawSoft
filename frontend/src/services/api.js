import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  inviteUser: async (email, rol) => {
    const response = await api.post('/auth/invite', { email, rol });
    return response.data;
  },
};

// Servicios de usuarios
export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  deactivateUser: async (id, reason = '') => {
    const response = await api.delete(`/users/${id}`, { 
      data: { reason } 
    });
    return response.data;
  },

  reactivateUser: async (id, reason = '') => {
    const response = await api.patch(`/users/${id}/reactivate`, { reason });
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/users/audit-logs', { params });
    return response.data;
  },

  getSystemStats: async () => {
    const response = await api.get('/users/system/stats');
    return response.data;
  },
};

// Servicio de salud del sistema
export const systemService = {
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
