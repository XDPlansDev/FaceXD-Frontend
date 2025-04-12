import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
console.log('API Base URL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Requisição:', config.method.toUpperCase(), config.url, config.data);
    return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    (response) => {
        console.log('Resposta:', response.status, response.config.url, response.data);
        return response;
    },
    (error) => {
        console.error('Erro na requisição:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.data);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api; 