import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Header from './components/Header.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Subordinates from './pages/Subordinates.jsx';
import Banners from './pages/Banners.jsx';
import PublicJobApplication from './pages/PublicJobApplication.jsx';
import PublicCandidateForm from './pages/PublicCandidateForm.jsx';
import ClientCandidateTracking from './pages/ClientCandidateTracking.jsx';
import Clients from './pages/Clients.jsx';
import AddClient from './components/AddClient.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ActiveBanner from './components/ActiveBanner.jsx';
import Analytics from './pages/Analytics.jsx';
import CandidateRankings from './pages/CandidateRankings.jsx';
import { setupAxiosInterceptors } from './utils/axiosConfig.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('jobs'); // Dashboard view state
  const [bannerHeight, setBannerHeight] = useState(0);
  const navigate = useNavigate();
  
  // Handle redirect from 404.html after we know auth state. When not logged in, only allow login/signup.
  useEffect(() => {
    if (loading) return;
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      const isPublicAuth = redirect === '/login' || redirect === '/signup';
      if (user || isPublicAuth) {
        navigate(redirect);
      } else {
        navigate('/login');
      }
    }
  }, [navigate, user, loading]);
  
  // Light mode is now the default theme

  // Auto-login only if we have a valid token (validate with backend so expired token doesn't show dashboard)
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      setLoading(false);
      return;
    }
    const apiUrl = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setUser(JSON.parse(userData));
        } else {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  // Set JWT and user in localStorage for 30 days
  const handleSetUser = (user, token) => {
    setUser(user);
    if (token) {
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  // Setup axios interceptors with navigate and logout
  useEffect(() => {
    setupAxiosInterceptors(navigate, handleLogout);
  }, [navigate, handleLogout]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f8fafc',
        color: '#1e293b',
        fontSize: '1.2rem',
        fontWeight: 600
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
      {user && <ActiveBanner onHeightChange={setBannerHeight} />}
      <Routes>
        {/* Public routes - no header, no authentication */}
        <Route path="/apply/:jobId" element={<PublicJobApplication />} />
        <Route path="/candidate-form" element={<PublicCandidateForm />} />
        <Route path="/client-tracking/:trackingToken" element={<ClientCandidateTracking />} />

        {/* Auth pages - no navbar, only when not logged in */}
        <Route path="/login" element={<Login setUser={handleSetUser} />} />
        <Route path="/signup" element={<Signup setUser={handleSetUser} />} />

        {/* Root redirect */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

        {/* Authenticated app - navbar + protected routes; unauthenticated redirect to login */}
        <Route path="/*" element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
          <>
            <Header 
              user={user} 
              onLogout={handleLogout} 
              view={view} 
              setView={setView}
              accessLevel={user?.accessLevel}
              bannerHeight={bannerHeight}
              setUser={handleSetUser}
            />
            <div style={{ paddingTop: `${72 + bannerHeight}px` }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute user={user}>
                      <Dashboard user={user} setUser={handleSetUser} onLogout={handleLogout} view={view} setView={setView} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subordinates" 
                  element={
                    <ProtectedRoute user={user}>
                      {user && user.accessLevel === 2 ? (
                        <Subordinates user={user} />
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100vh',
                          color: '#1e293b',
                          fontSize: '1.5rem'
                        }}>
                          Access Denied: Admin Only
                        </div>
                      )}
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/banners" 
                  element={
                    <ProtectedRoute user={user}>
                      {user && user.accessLevel === 2 ? (
                        <Banners user={user} />
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100vh',
                          color: '#1e293b',
                          fontSize: '1.5rem'
                        }}>
                          Access Denied: Admin Only
                        </div>
                      )}
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <ProtectedRoute user={user}>
                      <Clients user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/add-client" 
                  element={
                    <ProtectedRoute user={user}>
                      <AddClient 
                        onClose={() => navigate('/clients')}
                        onClientAdded={() => navigate('/clients')}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute user={user}>
                      <Analytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/candidate-rankings" 
                  element={
                    <ProtectedRoute user={user}>
                      <CandidateRankings />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </>
          )
        } />
      </Routes>
    </>
  );
}

export default App;
