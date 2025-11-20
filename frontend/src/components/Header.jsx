import React from 'react';
import logo from '../assets/StaffanchorLogoFinal.png';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate ? useNavigate() : () => {};
  
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="fixed" sx={{ 
      background: 'rgba(255, 255, 255, 0.98)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      borderBottom: '1px solid #e2e8f0',
      zIndex: 1000
    }} elevation={0}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', minHeight: 72, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
              transform: 'scale(1.02)',
              transition: 'all 0.2s ease'
            }
          }}
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="StaffAnchor"
            style={{ 
              height: 48, 
              width: 48, 
              objectFit: 'contain', 
              background: 'transparent', 
              borderRadius: 8, 
              marginRight: 16, 
              boxShadow: 'none' 
            }}
          />
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: '#1e293b', 
            letterSpacing: 1,
            background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            StaffAnchor ATS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!user && (
            <>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined" 
                color="inherit" 
                sx={{ 
                  borderColor: '#2563eb', 
                  color: '#2563eb', 
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    color: '#1d4ed8',
                    background: 'rgba(37, 99, 235, 0.05)'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/signup" 
                variant="contained" 
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
          {user && (
            <Button 
              component={Link} 
              to="/dashboard" 
              variant="outlined" 
              color="inherit" 
              sx={{ 
                borderColor: '#8b5cf6', 
                color: '#8b5cf6', 
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#7c3aed',
                  color: '#7c3aed',
                  background: 'rgba(139, 92, 246, 0.05)'
                }
              }}
            >
              Dashboard
            </Button>
          )}
          {user && (
            <Button 
              onClick={onLogout} 
              variant="outlined" 
              color="inherit" 
              sx={{ 
                borderColor: '#64748b', 
                color: '#475569', 
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#475569',
                  color: '#1e293b',
                  background: 'rgba(100, 116, 139, 0.05)'
                }
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
