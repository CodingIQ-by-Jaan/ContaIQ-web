import axios from 'axios';
import { useAuthStore } from '@/shared/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const orgId = state.activeOrgId;
  if (orgId) config.headers['X-Organization-Id'] = orgId;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if 401 AND not on auth/onboarding pages
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/onboarding'].includes(path);
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// No longer needed - interceptor reads directly from store
export const setAuthInterceptors = () => {};