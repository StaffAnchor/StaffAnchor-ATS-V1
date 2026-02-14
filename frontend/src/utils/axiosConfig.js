import axios from 'axios';
import { toast } from 'react-toastify';

let navigate = null;
let handleLogout = null;

// Track if we've already shown the session expired message
let sessionExpiredShown = false;

// Setup function to be called from App.jsx
export const setupAxiosInterceptors = (navigateFunction, logoutFunction) => {
  navigate = navigateFunction;
  handleLogout = logoutFunction;
  sessionExpiredShown = false; // Reset when setting up
};

// Request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle 401 errors for authenticated requests
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      
      // Don't handle 401 for login/signup endpoints
      if (requestUrl.includes('/login') || requestUrl.includes('/signup')) {
        return Promise.reject(error);
      }
      
      // Token is invalid or expired
      console.log('Authentication error: Token expired or invalid');
      
      // Clear local storage
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      
      // Show toast notification only once
      if (!sessionExpiredShown) {
        toast.error('Your session has expired. Please login again.');
        sessionExpiredShown = true;
        
        // Reset the flag after 3 seconds
        setTimeout(() => {
          sessionExpiredShown = false;
        }, 3000);
      }
      
      // Call logout handler if available (this will also navigate)
      if (handleLogout) {
        handleLogout();
      } else if (navigate) {
        // Fallback to just navigating if logout handler is not available
        navigate('/login', { replace: true });
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      const requestUrl = error.config?.url || '';
      const errorMessage = error.response?.data?.error || '';
      const isTokenError = /invalid|expired|token/i.test(errorMessage);

      // 403 from auth middleware = invalid/expired token → treat like 401: clear and redirect, no permission toast
      if (isTokenError) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        if (!sessionExpiredShown) {
          toast.error('Your session has expired. Please login again.');
          sessionExpiredShown = true;
          setTimeout(() => { sessionExpiredShown = false; }, 3000);
        }
        if (handleLogout) {
          handleLogout();
        } else if (navigate) {
          navigate('/login', { replace: true });
        }
        return Promise.reject(error);
      }

      // Real 403 (e.g. admin required): only show toast when request had auth
      const hadAuth = !!(error.config?.headers?.Authorization);
      if (!requestUrl.includes('/validate') && hadAuth) {
        toast.error('Access denied. You do not have permission for this action.');
      }
    }

    return Promise.reject(error);
  }
);

export default axios;

