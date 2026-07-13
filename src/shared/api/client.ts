import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

let getAccessToken: (() => string | null) | null = null;
let getActiveOrgId: (() => string | null) | null = null;

export const setAuthInterceptors = (
  tokenGetter: () => string | null,
  orgIdGetter: () => string | null,
) => {
  getAccessToken = tokenGetter;
  getActiveOrgId = orgIdGetter;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const orgId = getActiveOrgId?.();
  if (orgId) config.headers['X-Organization-Id'] = orgId;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
