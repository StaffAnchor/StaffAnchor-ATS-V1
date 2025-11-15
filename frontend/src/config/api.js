// API Base URL Configuration
// This will use the environment variable in production/development
// or fallback to production URL

const API_URL = import.meta.env.VITE_API_URL || 'https://staffanchor-ats-v1.onrender.com';

export default API_URL;

