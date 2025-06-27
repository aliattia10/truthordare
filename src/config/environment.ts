// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Socket server URL
// For testing purposes, we'll use a temporary solution
// TODO: Deploy server to Render and update this URL
export const SOCKET_SERVER_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://truthordare-vouh.onrender.com';

// API endpoints
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://truthordare-vouh.onrender.com';

// Environment info
export const ENV = {
  isDevelopment,
  isProduction,
  NODE_ENV: import.meta.env.MODE,
}; 