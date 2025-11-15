import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import officePic02 from '../assets/officepic02.jpg';
import './AuthPages.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('https://ats-backend-2vus.onrender.com/api/auth/login', { email, password });
      setUser(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Image */}
        <div className="auth-image-section">
          <img src={officePic02} alt="Modern Office" className="auth-image" />
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <Paper elevation={0} className="auth-form-paper">
            <div className="auth-form-header">
              <Typography variant="h4" className="auth-form-title">
                Sign In
              </Typography>
              <Typography variant="body2" className="auth-form-subtitle">
                Enter your credentials to access your account
              </Typography>
            </div>

            <Box component="form" onSubmit={handleSubmit} className="auth-form">
              {error && (
                <Alert severity="error" className="auth-alert">
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#b8c5d6' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(238, 187, 195, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#eebbc3',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b8c5d6',
                  },
                  '& .MuiInputBase-input': {
                    color: '#f5f7fa',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#b8c5d6' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#b8c5d6' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(238, 187, 195, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#eebbc3',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b8c5d6',
                  },
                  '& .MuiInputBase-input': {
                    color: '#f5f7fa',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="auth-submit-button"
                sx={{
                  background: 'linear-gradient(135deg, #4f8cff 0%, #eebbc3 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '12px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3a7bd5 0%, #d4a5ac 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(79, 140, 255, 0.3)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="auth-form-footer">
                <Typography variant="body2" className="auth-form-footer-text">
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-link">
                    Sign up here
                  </Link>
                </Typography>
              </div>
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default Login;
