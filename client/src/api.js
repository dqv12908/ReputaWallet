import axios from 'axios';
import process from 'process/browser';

// Ensure process is available globally
if (typeof window !== 'undefined') {
  window.process = process;
}

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api; 