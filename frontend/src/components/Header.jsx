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
      background: 'rgba(15, 15, 35, 0.95)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            color: '#f5f7fa', 
            letterSpacing: 1,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #eebbc3 100%)',
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
                  borderColor: '#f5f7fa', 
                  color: '#f5f7fa', 
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#eebbc3',
                    color: '#eebbc3',
                    background: 'rgba(238, 187, 195, 0.1)'
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
                  background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(79, 140, 255, 0.3)'
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
                borderColor: '#eebbc3', 
                color: '#eebbc3', 
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(238, 187, 195, 0.1)'
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
                borderColor: '#f5f7fa', 
                color: '#f5f7fa', 
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#eebbc3',
                  color: '#eebbc3',
                  background: 'rgba(238, 187, 195, 0.1)'
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
