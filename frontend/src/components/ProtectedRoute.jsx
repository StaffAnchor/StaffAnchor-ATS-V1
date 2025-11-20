import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  const token = localStorage.getItem('jwt');
  
  // Check if user is authenticated (has both token and user data)
  if (!token || !user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  // Token validity will be checked by axios interceptor during API calls
  return children;
};

export default ProtectedRoute;

