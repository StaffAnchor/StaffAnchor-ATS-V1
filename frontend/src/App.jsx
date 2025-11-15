import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Header from './components/Header.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Subordinates from './pages/Subordinates.jsx';
import PublicJobApplication from './pages/PublicJobApplication.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Handle redirect from 404.html
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      navigate(redirect);
    }
  }, [navigate]);
  
  // Always dark mode
  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);

  // Auto-login with JWT from localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false); // Done checking authentication
  }, []);

  // Set JWT and user in localStorage for 30 days
  const handleSetUser = (user, token) => {
    setUser(user);
    if (token) {
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#1a1a2e',
        color: '#f5f7fa' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      <Routes>
        {/* Public route - no header, no authentication */}
        <Route path="/apply/:jobId" element={<PublicJobApplication />} />
        
        {/* Authenticated routes */}
        <Route path="/*" element={
          <>
            <Header user={user} onLogout={handleLogout} />
            <div style={{ paddingTop: user ? '72px' : '0' }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login setUser={handleSetUser} />} />
                <Route path="/signup" element={<Signup setUser={handleSetUser} />} />
                <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={handleSetUser} onLogout={handleLogout} /> : <LandingPage />} />
                {user && user.accessLevel === 2 && (
                  <Route path="/subordinates" element={<Subordinates user={user} />} />
                )}
              </Routes>
            </div>
          </>
        } />
      </Routes>
    </>
  );
}

export default App;
