import axios from 'axios';
import { getToken } from '../utils/storage';

// Change this to your backend URL
// For local development with Android emulator: http://10.0.2.2:5000/api
// For local development with iOS simulator: http://localhost:5000/api
// For local development with physical device: http://YOUR_LOCAL_IP:5000/api
// For production: https://your-backend.onrender.com/api

const API_BASE_URL = __DEV__ 
  ? 'http://10.128.146.248:5000/api' // Your computer's IP for physical device testing
  : 'https://your-backend.onrender.com/api'; // Update with your production URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;

// Helper function to change API base URL (useful for development)
export const setApiBaseUrl = (url) => {
  api.defaults.baseURL = url;
};
