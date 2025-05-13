import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://foodreduce-backend.azurewebsites.net/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post('https://foodreduce-backend.azurewebsites.net/api/auth/refresh-token', 
            { refreshToken },
            { withCredentials: true }
          );
          
          const { token, user } = response.data;
          
          // Update tokens
          Cookies.set('token', token, { secure: true, sameSite: 'strict' });
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Redirect to login if refresh fails
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      
      // Handle specific error statuses
      switch (status) {
        case 403:
          console.error('Forbidden:', data.message || 'You do not have permission to perform this action');
          break;
        case 404:
          console.error('Not Found:', data.message || 'The requested resource was not found');
          break;
        case 500:
          console.error('Server Error:', data.message || 'An internal server error occurred');
          break;
        default:
          console.error(`Error ${status}:`, data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', 'Unable to connect to the server. Please check your connection.');
    } else {
      // Something else happened while setting up the request
      console.error('Request Error:', error.message);
    }
    
    // If we get here, it means we have an error that wasn't handled above
    return Promise.reject(error);
  }
);

export default api;
