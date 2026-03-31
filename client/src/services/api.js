import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors — do NOT hard-redirect on 401 as it breaks React Router auth flow
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only redirect if it's a deliberate auth revocation on protected dashboard routes
    // NOT on all 401s (e.g. missing DB tables, wrong service key, etc.)
    const url = error.config?.url || '';
    const isAuthMeEndpoint = url.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthMeEndpoint) {
      // Let the caller handle it — don't auto-redirect
    }
    return Promise.reject(error);
  }
);

export default api;
