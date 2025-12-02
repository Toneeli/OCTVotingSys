import axios from 'axios';

// 根据环境自动确定 API 地址
const getApiBaseUrl = () => {
  // 如果在浏览器中，使用当前主机名
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = process.env.REACT_APP_API_PORT || 3001;
    
    // 如果是本地开发环境，使用 localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    
    // 如果是公网 IP，使用当前域名/IP
    return `${protocol}//${hostname}:${port}/api`;
  }
  
  return 'http://localhost:3001/api';
};

const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default client;
