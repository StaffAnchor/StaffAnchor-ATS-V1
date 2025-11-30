import React, { useState } from 'react';
import logo from '../assets/StaffanchorLogoFinal.png';
import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogContent, DialogActions, Typography, Avatar, CircularProgress } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Add as AddIcon, Work as WorkIcon, Person as PersonIcon, Analytics as AnalyticsIcon, Description as DescriptionIcon, Construction as ConstructionIcon, AccountCircle as AccountCircleIcon, Business as BusinessIcon, Campaign as CampaignIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import Profile from '../pages/Profile';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const Header = ({ user, onLogout, view, setView, accessLevel, bannerHeight = 0, setUser }) => {
  const navigate = useNavigate ? useNavigate() : () => {};
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [showResumeUploadDialog, setShowResumeUploadDialog] = useState(false);
  
  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
      if (setView) setView('jobs');
    } else {
      navigate('/login');
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAddJob = () => {
    if (setView) setView('addJob');
    handleCloseMenu();
    navigate('/dashboard');
  };

  const handleAddCandidate = () => {
    if (setView) setView('addCandidate');
    handleCloseMenu();
    navigate('/dashboard');
  };

  const handleAddByResume = () => {
    handleCloseMenu();
    setShowResumeUploadDialog(true);
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOC/DOCX files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setParsingResume(true);
    setShowResumeUploadDialog(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `${API_URL}/api/candidates/parse-resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const parsedData = response.data;
      
      // Navigate to AddCandidate with parsed data and the file
      navigate('/dashboard', { 
        state: { 
          parsedData,
          resumeFile: file,
          fromResumeParsing: true
        } 
      });
      
      if (setView) setView('addCandidate');
      toast.success('Resume parsed successfully!');
    } catch (error) {
      // Check if it's a rate limit error
      if (error.response?.status === 429 || error.response?.data?.error === 'AI_RATE_LIMIT') {
        toast.error('⏳ AI service is busy. Please try again in a minute.', {
          autoClose: 8000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B'
          }
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to parse resume. Please try again.');
      }
    } finally {
      setParsingResume(false);
    }
  };

  const handleAnalytics = () => {
    setShowFeatureDialog(true);
  };

  const handleInternalRecruitersTab = () => {
    navigate('/subordinates');
  };

  const handleBannerTab = () => {
    navigate('/banners');
  };

  const getTabStyle = (active) =>
    active
      ? { background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)', color: '#ffffff', fontWeight: 700, border: '2px solid transparent', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }
      : { background: '#ffffff', color: '#475569', border: '2px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' };

  return (
    <AppBar position="fixed" sx={{ 
      background: 'rgba(255, 255, 255, 0.98)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      borderBottom: '1px solid #e2e8f0',
      zIndex: 1200,
      top: `${bannerHeight}px`
    }} elevation={0}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', minHeight: 72, maxWidth: '100%', width: '100%', px: 3 }}>
        {/* Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
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
              height: 64, 
              width: 64, 
              objectFit: 'contain', 
              background: 'transparent', 
              borderRadius: 8, 
              boxShadow: 'none' 
            }}
          />
        </Box>

        {/* Dashboard Navigation - Only show when user is logged in */}
        {user && setView && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            alignItems: 'center',
            ml: 4,
            flex: 1
          }}>
            {/* 1. Jobs */}
            <Button 
              sx={{
                ...getTabStyle(location.pathname === '/dashboard' && view === 'jobs'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
              }} 
              onClick={() => {
                setView('jobs');
                navigate('/dashboard');
              }}
            >
              Jobs
            </Button>

            {/* 2. Client side status */}
            <Button 
              sx={{
                ...getTabStyle(location.pathname === '/dashboard' && view === 'workflows'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
              }} 
              onClick={() => {
                setView('workflows');
                navigate('/dashboard');
              }}
            >
              Client side status
            </Button>

            {/* 3. Candidates */}
            <Button 
              sx={{
                ...getTabStyle(location.pathname === '/dashboard' && view === 'candidates'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
              }} 
              onClick={() => {
                setView('candidates');
                navigate('/dashboard');
              }}
            >
              Candidates
            </Button>

            {/* 4. Domain, Talent pools and skills */}
            <Button 
              sx={{
                ...getTabStyle(location.pathname === '/dashboard' && view === 'talentPools'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
              }} 
              onClick={() => {
                setView('talentPools');
                navigate('/dashboard');
              }}
            >
              Domain, Talent pools and skills
            </Button>

            {/* 5. Clients */}
            <Button 
              sx={{
                ...getTabStyle(location.pathname === '/clients'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
              }} 
              onClick={() => navigate('/clients')}
            >
              Clients
            </Button>

            {/* 6. Internal Recruiters (only for accessLevel 2) */}
            {accessLevel === 2 && (
              <Button 
                sx={{
                  ...getTabStyle(location.pathname === '/subordinates'),
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  minWidth: 'auto'
                }} 
                onClick={handleInternalRecruitersTab}
              >
                Internal Recruiters
              </Button>
            )}
            
            {/* 7. Analytics button */}
            <Button
              onClick={handleAnalytics}
              sx={{
                background: '#ffffff',
                color: '#475569',
                border: '2px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              Analytics
            </Button>

            {/* 8. Banner (only for accessLevel 2) */}
            {accessLevel === 2 && (
              <Button 
                sx={{
                  ...getTabStyle(location.pathname === '/banners'),
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  minWidth: 'auto',
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center'
                }} 
                onClick={handleBannerTab}
              >
                <CampaignIcon sx={{ fontSize: '1.1rem' }} />
                Banner
              </Button>
            )}
            
            {/* Add button with dropdown */}
            <IconButton
              onClick={handleOpenMenu}
              sx={{
                backgroundColor: location.pathname === '/dashboard' && (view === 'addJob' || view === 'addCandidate') ? '#10b981' : '#ffffff',
                color: location.pathname === '/dashboard' && (view === 'addJob' || view === 'addCandidate') ? '#ffffff' : '#475569',
                border: '2px solid',
                borderColor: location.pathname === '/dashboard' && (view === 'addJob' || view === 'addCandidate') ? '#10b981' : '#e2e8f0',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  backgroundColor: location.pathname === '/dashboard' && (view === 'addJob' || view === 'addCandidate') ? '#059669' : '#f8fafc',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <AddIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  minWidth: '200px',
                  mt: 1,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem 
                onClick={handleAddCandidate}
                sx={{
                  color: '#1e293b',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  }
                }}
              >
                <ListItemIcon>
                  <PersonIcon sx={{ color: '#8b5cf6' }} />
                </ListItemIcon>
                <ListItemText>Add Candidate</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handleAddJob}
                sx={{
                  color: '#1e293b',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  }
                }}
              >
                <ListItemIcon>
                  <WorkIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText>Add Job</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleCloseMenu();
                  navigate('/add-client');
                }}
                sx={{
                  color: '#1e293b',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  }
                }}
              >
                <ListItemIcon>
                  <BusinessIcon sx={{ color: '#10b981' }} />
                </ListItemIcon>
                <ListItemText>Add Client</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handleAddByResume}
                sx={{
                  color: '#1e293b',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  }
                }}
              >
                <ListItemIcon>
                  <DescriptionIcon sx={{ color: '#10b981' }} />
                </ListItemIcon>
                <ListItemText>Add Candidate by Resume</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Right side buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
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
                  textTransform: 'none',
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
                  textTransform: 'none',
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
            <>
              <IconButton
                onClick={() => setShowProfile(true)}
                sx={{
                  color: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <AccountCircleIcon />
              </IconButton>
              <Button 
                onClick={onLogout} 
                variant="outlined" 
                sx={{ 
                  borderColor: '#ef4444', 
                  color: '#ef4444', 
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    background: 'rgba(239, 68, 68, 0.08)'
                  }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Feature Under Development Dialog */}
      <Dialog
        open={showFeatureDialog}
        onClose={() => setShowFeatureDialog(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <ConstructionIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
            This feature is currently under development
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowFeatureDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Upload Dialog */}
      <Dialog
        open={showResumeUploadDialog}
        onClose={() => setShowResumeUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <CloudUploadIcon sx={{ fontSize: 64, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 2 }}>
            Upload Resume for AI Parsing
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Upload a PDF or DOC/DOCX file. Our AI will automatically extract information and intelligently match the candidate to appropriate domains, talent pools, and skills.
          </Typography>
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="resume-upload-input"
            type="file"
            onChange={handleResumeUpload}
          />
          <label htmlFor="resume-upload-input">
            <Button
              variant="contained"
              component="span"
              disabled={parsingResume}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                }
              }}
            >
              Choose File
            </Button>
          </label>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowResumeUploadDialog(false)}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Parsing Resume Dialog */}
      <Dialog
        open={parsingResume}
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 4 }}>
          <CircularProgress sx={{ color: '#8b5cf6', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
            Parsing resume with AI...
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
            This may take 5-10 seconds
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {user && (
        <Profile
          open={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          setUser={setUser}
        />
      )}
    </AppBar>
  );
};

export default Header;
