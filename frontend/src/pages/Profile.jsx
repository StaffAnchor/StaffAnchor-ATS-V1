import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const Profile = ({ open, onClose, user, setUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone?.replace('+91', '') || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyCandidateFormLink = () => {
    const baseUrl = window.location.origin;
    const candidateFormUrl = `${baseUrl}/candidate-form`;
    
    navigator.clipboard.writeText(candidateFormUrl).then(() => {
      toast.success('Candidate form link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone?.replace('+91', '') || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone, only allow digits and limit to 10
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digits });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone?.replace('+91', '') || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.currentPassword) {
      toast.error('Current password is required to make changes');
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error('Phone must be 10 digits');
      return;
    }

    // Password change validation
    if (formData.newPassword || formData.confirmNewPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
      
      if (!passwordRegex.test(formData.newPassword)) {
        toast.error('New password must be 8+ chars with upper/lowercase, number, and special character');
        return;
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: `+91${formData.phone}`,
        currentPassword: formData.currentPassword
      };

      // Include new password only if provided
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local user data
      const updatedUser = response.data.user;
      setUser(updatedUser, token);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully');
      setEditMode(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
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
        borderColor: '#8b5cf6',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8b5cf6',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#8b5cf6',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#1e293b',
          fontWeight: 600,
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
              My Profile
            </Typography>
          </Box>
          <Button
            onClick={handleCopyCandidateFormLink}
            startIcon={<ContentCopyIcon />}
            sx={{
              color: '#1976d2',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              }
            }}
          >
            Candidate Form
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!editMode && (
            <IconButton
              onClick={() => setEditMode(true)}
              sx={{
                color: '#8b5cf6',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                }
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={!editMode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              ...textFieldStyles,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#1e293b',
              },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!editMode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              ...textFieldStyles,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#1e293b',
              },
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="10 digit mobile number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon sx={{ color: '#64748b' }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 500, userSelect: 'none' }}>
                      +91
                    </Typography>
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              ...textFieldStyles,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#1e293b',
              },
            }}
          />

          {editMode && (
            <>
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Authentication Required
              </Typography>

              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Change Password (Optional)
              </Typography>

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmNewPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmNewPassword}
                onChange={handleChange}
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
            </>
          )}
        </Box>
      </DialogContent>

      {editMode && (
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <Button
            onClick={handleCancel}
            disabled={loading}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              },
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Profile;

