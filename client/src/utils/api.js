import axios from 'axios';
import { getAdminToken, getCustomerToken } from './auth';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) return configuredUrl;

  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const { origin, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  return `${origin}/api`;
}

export const api = axios.create({ baseURL: resolveApiBaseUrl() });

api.interceptors.request.use((config) => {
  if (config.headers.Authorization) return config;

  const url = config.url || '';
  const token = url.startsWith('/admin') ? getAdminToken() : getCustomerToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
