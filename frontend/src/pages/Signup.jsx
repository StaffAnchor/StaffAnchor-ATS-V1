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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Lock as LockIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import officePic03 from '../assets/officepic03.jpg';
import './AuthPages.css';

const Signup = ({ setUser }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '+91',
    password: '',
    confirmPassword: '',
    accessLevel: '1',
    organization: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const phoneRegex = /^\+91\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!phoneRegex.test(form.phone)) return 'Phone must be +91 followed by 10 digits.';
    if (!passwordRegex.test(form.password)) return 'Password must be 8+ chars, upper/lowercase, number, special char.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const err = validate();
    if (err) {
      setError(err);
      toast.error(err);
      setLoading(false);
      return;
    }
    
    try {
      await axios.post('https://staffanchor-ats-v1.onrender.com/api/auth/signup', form);
      // After signup, immediately log in to get user object
      const loginRes = await axios.post('https://staffanchor-ats-v1.onrender.com/api/auth/login', { email: form.email, password: form.password });
      setUser(loginRes.data.user, loginRes.data.token);
      toast.success('Signup successful!');
      navigate('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
      toast.error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#e2e8f0',
      },
      '&:hover fieldset': {
        borderColor: '#2563eb',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563eb',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#64748b',
    },
    '& .MuiInputBase-input': {
      color: '#1e293b',
    },
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Image */}
        <div className="auth-image-section">
          <img src={officePic03} alt="Modern Office" className="auth-image" />
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <Paper elevation={0} className="auth-form-paper">
            <div className="auth-form-header">
              <Typography variant="h4" className="auth-form-title">
                Create Account
              </Typography>
              <Typography variant="body2" className="auth-form-subtitle">
                Join thousands of companies already using StaffAnchor ATS
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
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <FormControl fullWidth className="auth-input">
                <InputLabel sx={{ color: '#64748b' }}>Access Level</InputLabel>
                <Select
                  name="accessLevel"
                  value={form.accessLevel}
                  onChange={handleChange}
                  sx={{
                    color: '#1e293b',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#64748b',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                        '& .MuiMenuItem-root': {
                          color: '#1e293b',
                          '&:hover': {
                            backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            '&:hover': {
                              backgroundColor: 'rgba(37, 99, 235, 0.18)',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="1">Level 1 - Subordinate</MenuItem>
                  <MenuItem value="2">Level 2 - Admin</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="auth-submit-button"
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '12px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="auth-form-footer">
                <Typography variant="body2" className="auth-form-footer-text">
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in here
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

export default Signup;
