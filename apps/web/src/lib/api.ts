import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create();

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: attempt silent refresh, then retry once
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint = original?.url?.includes('/api/auth');
    if (error.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      // Deduplicate concurrent 401s — only one refresh call at a time
      if (!refreshPromise) {
        refreshPromise = axios
          .post('/api/auth/refresh', null, { withCredentials: true })
          .then((r) => r.data.accessToken)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      useAuthStore.getState().setToken(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
);
