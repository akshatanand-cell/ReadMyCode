import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Repository APIs
export const repoAPI = {
  getAll: (params) => api.get('/repos', { params }),
  getById: (id) => api.get(`/repos/${id}`),
  create: (data) => api.post('/repos', data),
  analyzeFromUrl: (data) => api.post('/repos/analyze', data),
  delete: (id) => api.delete(`/repos/${id}`),
  analyze: (id) => api.post(`/repos/${id}/analyze`),
  getStatus: (id) => api.get(`/repos/${id}/status`),
  uploadZip: (formData) => api.post('/repos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Analysis APIs
export const analysisAPI = {
  getReadme: (repoId) => api.get(`/readme/${repoId}`),
  getApiDocs: (repoId) => api.get(`/docs/${repoId}`),
  getFlowchart: (repoId) => api.get(`/diagrams/flowchart/${repoId}`),
  getArchitecture: (repoId) => api.get(`/diagrams/architecture/${repoId}`),
  getFunctions: (repoId) => api.get(`/diagrams/functions/${repoId}`),
  getDebugger: (data) => api.post(`/debug`, data),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecent: () => api.get('/dashboard/recent'),
  getActivity: () => api.get('/dashboard/activity'),
};

export default api;