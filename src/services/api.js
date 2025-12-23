import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
        error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            // Refresh token yoksa kullanıcıyı dışarı at
            throw new Error('No refresh token');
        }

        const refreshUrl = import.meta.env.VITE_API_URL || '/api/v1';
        const res = await axios.post(`${refreshUrl}/auth/refresh`, { 
            refreshToken 
        });

        if (res.data.success) {
          localStorage.setItem('token', res.data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Login hatasıysa veya yenileme başarısızsa buraya düşer
    return Promise.reject(error);
  }
);

export default api;