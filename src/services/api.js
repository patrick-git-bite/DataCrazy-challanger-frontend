import axios from 'axios';

const API_BASE_URL = 'https://api.openai.com/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autorização
api.interceptors.request.use(
  (config) => {
    const token = process.env.REACT_APP_OPENAI_API_KEY;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;