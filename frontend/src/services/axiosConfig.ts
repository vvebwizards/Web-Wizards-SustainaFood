import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://foodreduce-backend.azurewebsites.net/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Keep this for now, but our interceptor will handle auth
  timeout: 15000, // 15 seconds timeout
});

// Add request interceptor to attach token to all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from various sources
    const token = 
      localStorage.getItem('token') || 
      Cookies.get('token') || 
      (document.cookie.match(/(?:^|; )token=([^;]*)/) || [])[1];

    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error);
    
    // If the error is a 401 (Unauthorized), it might mean the token is expired
    if (error.response && error.response.status === 401) {
      console.log('Authentication error - clearing tokens');
      localStorage.removeItem('token');
      Cookies.remove('token');
      // Could redirect to login page here or handle in your auth context
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
