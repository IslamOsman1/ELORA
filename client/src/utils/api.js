import axios from 'axios';
import { getAdminToken, getCustomerToken } from './auth';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  if (config.headers.Authorization) return config;

  const url = config.url || '';
  const token = url.startsWith('/admin') ? getAdminToken() : getCustomerToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
