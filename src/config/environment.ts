// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Socket server URL
// Check for dynamic environment variable first (for webcontainer/dynamic environments)
// then fall back to localhost for local development
export const SOCKET_SERVER_URL = isDevelopment 
  ? (import.meta.env.VITE_APP_SOCKET_SERVER_URL || 'http://localhost:3001')
  : 'https://truthordare-vouh.onrender.com';

// API endpoints
export const API_BASE_URL = isDevelopment 
  ? (import.meta.env.VITE_APP_SOCKET_SERVER_URL || 'http://localhost:3001')
  : 'https://truthordare-vouh.onrender.com';

// Environment info
export const ENV = {
  isDevelopment,
  isProduction,
  NODE_ENV: import.meta.env.MODE,
};