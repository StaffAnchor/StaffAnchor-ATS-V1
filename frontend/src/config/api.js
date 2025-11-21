// API Base URL Configuration
// This will use the environment variable in production/development
// or fallback to localhost for development

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default API_URL;

