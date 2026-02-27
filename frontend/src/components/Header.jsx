import React, { useState } from 'react';
import logo from '../assets/StaffanchorLogoFinal.png';
import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogContent, DialogActions, Typography, CircularProgress, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Add as AddIcon, Work as WorkIcon, Person as PersonIcon, Analytics as AnalyticsIcon, Description as DescriptionIcon, Construction as ConstructionIcon, AccountCircle as AccountCircleIcon, Business as BusinessIcon, Campaign as CampaignIcon, CloudUpload as CloudUploadIcon, Menu as MenuIcon, Logout as LogoutIcon, ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import Profile from '../pages/Profile';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const Header = ({ user, onLogout, view, setView, accessLevel, bannerHeight = 0, setUser }) => {
  const navigate = useNavigate ? useNavigate() : () => {};
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md = 900px
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [addSubmenuExpanded, setAddSubmenuExpanded] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsingResumeProgress, setParsingResumeProgress] = useState({ current: 0, total: 0 });
  const [showResumeUploadDialog, setShowResumeUploadDialog] = useState(false);
  const MAX_RESUMES_ADD_BY_RESUME = 5;
  
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

  const handleOpenMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
    setAddSubmenuExpanded(false);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchor(null);
    setAddSubmenuExpanded(false);
  };

  const handleMobileNav = (fn) => {
    return () => {
      if (fn) fn();
      handleCloseMobileMenu();
    };
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
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = files
      .filter((f) => {
        if (!allowedTypes.includes(f.type)) {
          toast.error(`Skipped "${f.name}": only PDF and DOC/DOCX are allowed`);
          return false;
        }
        if (f.size > 10 * 1024 * 1024) {
          toast.error(`Skipped "${f.name}": file must be less than 10MB`);
          return false;
        }
        return true;
      })
      .slice(0, MAX_RESUMES_ADD_BY_RESUME);

    if (validFiles.length === 0) return;
    if (files.length > MAX_RESUMES_ADD_BY_RESUME) {
      toast.info(`Only the first ${MAX_RESUMES_ADD_BY_RESUME} files will be processed.`);
    }

    setParsingResume(true);
    setParsingResumeProgress({ current: 0, total: validFiles.length });
    setShowResumeUploadDialog(false);

    const token = localStorage.getItem('jwt');
    const parsedCandidates = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setParsingResumeProgress({ current: i + 1, total: validFiles.length });
        const file = validFiles[i];
        const formData = new FormData();
        formData.append('resume', file);
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
        parsedCandidates.push({ parsedData: response.data, file });
      }

      const state = {
        fromResumeParsing: true,
        parsedCandidates
      };
      if (parsedCandidates.length === 1) {
        state.parsedData = parsedCandidates[0].parsedData;
        state.resumeFile = parsedCandidates[0].file;
      }

      navigate('/dashboard', { state });
      if (setView) setView('addCandidate');
      toast.success(parsedCandidates.length === 1 ? 'Resume parsed successfully!' : `${parsedCandidates.length} resumes parsed. Review and save each candidate.`);
    } catch (error) {
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
      setParsingResumeProgress({ current: 0, total: 0 });
    }
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleInternalRecruitersTab = () => {
    navigate('/subordinates');
  };

  const handleBannerTab = () => {
    navigate('/banners');
  };

  const getTabStyle = (active) =>
    active
      ? { 
          background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)', 
          color: '#ffffff', 
          fontWeight: 700, 
          border: '2px solid transparent', 
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
            color: '#ffffff',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)'
          }
        }
      : { 
          background: '#ffffff', 
          color: '#475569', 
          border: '2px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#ffffff',
            border: '2px solid transparent',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }
        };

  return (
    <AppBar position="fixed" sx={{ 
      background: 'rgba(255, 255, 255, 0.98)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      borderBottom: '1px solid #e2e8f0',
      zIndex: 1200,
      top: `${bannerHeight}px`
    }} elevation={0}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        minHeight: { xs: 56, md: 72 }, 
        maxWidth: '100%', 
        width: '100%', 
        px: { xs: 1.5, md: 3 } 
      }}>
        {/* Logo - top left */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            flexShrink: 0,
            height: { xs: 40, md: 56 },
            width: { xs: 40, md: 56 },
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
              height: '100%',
              width: 'auto',
              maxHeight: 56,
              objectFit: 'contain', 
              background: 'transparent', 
              borderRadius: 8, 
              boxShadow: 'none' 
            }}
          />
        </Box>

        {/* Mobile: Hamburger at center, then spacer so profile/logout stay right */}
        {user && isMobile && (
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <IconButton
              onClick={handleOpenMobileMenu}
              sx={{
                color: '#475569',
                backgroundColor: 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                },
                width: 44,
                height: 44,
              }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Dashboard Navigation - Desktop only, when user is logged in */}
        {user && setView && !isMobile && (
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

            {/* 2. Candidates */}
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
                ...getTabStyle(location.pathname === '/analytics'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto'
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

            {/* 9. Candidate Rankings */}
            <Button
              onClick={() => navigate('/candidate-rankings')}
              sx={{
                ...getTabStyle(location.pathname === '/candidate-rankings'),
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: '8px',
                minWidth: 'auto',
                display: 'flex',
                gap: 0.5,
                alignItems: 'center'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: '1.1rem' }} />
              Candidate Rankings
            </Button>
            
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
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#8b5cf6',
                    '& .MuiListItemIcon-root': {
                      color: '#8b5cf6'
                    }
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
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                    color: '#2563eb',
                    '& .MuiListItemIcon-root': {
                      color: '#2563eb'
                    }
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
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    '& .MuiListItemIcon-root': {
                      color: '#10b981'
                    }
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
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    '& .MuiListItemIcon-root': {
                      color: '#10b981'
                    }
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
                aria-label="Profile"
              >
                <AccountCircleIcon />
              </IconButton>
              {isMobile ? (
                <IconButton
                  onClick={onLogout}
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    },
                    width: 40,
                    height: 40,
                  }}
                  aria-label="Logout"
                >
                  <LogoutIcon />
                </IconButton>
              ) : (
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
              )}
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile nav dropdown */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleCloseMobileMenu}
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            minWidth: 280,
            maxWidth: 'calc(100vw - 32px)',
            mt: 1.5,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: 'calc(100dvh - 100px)',
            overflow: 'auto',
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMobileNav(() => { setView?.('jobs'); navigate('/dashboard'); })} sx={{ py: 1.5 }}>
          <ListItemIcon><WorkIcon sx={{ color: '#2563eb' }} /></ListItemIcon>
          <ListItemText>Jobs</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMobileNav(() => { setView?.('candidates'); navigate('/dashboard'); })} sx={{ py: 1.5 }}>
          <ListItemIcon><PersonIcon sx={{ color: '#8b5cf6' }} /></ListItemIcon>
          <ListItemText>Candidates</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMobileNav(() => { setView?.('talentPools'); navigate('/dashboard'); })} sx={{ py: 1.5 }}>
          <ListItemIcon><AnalyticsIcon sx={{ color: '#64748b' }} /></ListItemIcon>
          <ListItemText>Domain, Talent pools and skills</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMobileNav(() => navigate('/clients'))} sx={{ py: 1.5 }}>
          <ListItemIcon><BusinessIcon sx={{ color: '#10b981' }} /></ListItemIcon>
          <ListItemText>Clients</ListItemText>
        </MenuItem>
        {accessLevel === 2 && (
          <MenuItem onClick={handleMobileNav(handleInternalRecruitersTab)} sx={{ py: 1.5 }}>
            <ListItemIcon><PersonIcon sx={{ color: '#64748b' }} /></ListItemIcon>
            <ListItemText>Internal Recruiters</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleMobileNav(handleAnalytics)} sx={{ py: 1.5 }}>
          <ListItemIcon><AnalyticsIcon sx={{ color: '#2563eb' }} /></ListItemIcon>
          <ListItemText>Analytics</ListItemText>
        </MenuItem>
        {accessLevel === 2 && (
          <MenuItem onClick={handleMobileNav(handleBannerTab)} sx={{ py: 1.5 }}>
            <ListItemIcon><CampaignIcon sx={{ color: '#64748b' }} /></ListItemIcon>
            <ListItemText>Banner</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleMobileNav(() => navigate('/candidate-rankings'))} sx={{ py: 1.5 }}>
          <ListItemIcon><EmojiEventsIcon sx={{ color: '#f59e0b' }} /></ListItemIcon>
          <ListItemText>Candidate Rankings</ListItemText>
        </MenuItem>
        {/* Expandable Add section */}
        <MenuItem
          onClick={() => setAddSubmenuExpanded((e) => !e)}
          sx={{ py: 1.5, borderTop: '1px solid #e2e8f0', mt: 0.5 }}
        >
          <ListItemIcon>
            <AddIcon sx={{ color: '#10b981' }} />
          </ListItemIcon>
          <ListItemText>Add</ListItemText>
          {addSubmenuExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </MenuItem>
        <Collapse in={addSubmenuExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 3, pr: 1, py: 0.5 }}>
            <MenuItem dense onClick={handleMobileNav(handleAddCandidate)} sx={{ py: 1.25 }}>
              <ListItemIcon><PersonIcon sx={{ fontSize: 20, color: '#8b5cf6' }} /></ListItemIcon>
              <ListItemText primary="Add Candidate" />
            </MenuItem>
            <MenuItem dense onClick={handleMobileNav(handleAddJob)} sx={{ py: 1.25 }}>
              <ListItemIcon><WorkIcon sx={{ fontSize: 20, color: '#2563eb' }} /></ListItemIcon>
              <ListItemText primary="Add Job" />
            </MenuItem>
            <MenuItem dense onClick={handleMobileNav(() => navigate('/add-client'))} sx={{ py: 1.25 }}>
              <ListItemIcon><BusinessIcon sx={{ fontSize: 20, color: '#10b981' }} /></ListItemIcon>
              <ListItemText primary="Add Client" />
            </MenuItem>
            <MenuItem dense onClick={handleMobileNav(handleAddByResume)} sx={{ py: 1.25 }}>
              <ListItemIcon><DescriptionIcon sx={{ fontSize: 20, color: '#10b981' }} /></ListItemIcon>
              <ListItemText primary="Add Candidate by Resume" />
            </MenuItem>
          </Box>
        </Collapse>
      </Menu>

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
            Upload up to {MAX_RESUMES_ADD_BY_RESUME} PDF or DOC/DOCX files. Our AI will extract information and match each candidate to domains, talent pools, and skills.
          </Typography>
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="resume-upload-input"
            type="file"
            multiple
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
              Choose file(s) (up to {MAX_RESUMES_ADD_BY_RESUME})
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
            {parsingResumeProgress.total > 1
              ? `Parsing resume ${parsingResumeProgress.current} of ${parsingResumeProgress.total}...`
              : 'Parsing resume with AI...'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
            This may take 5–10 seconds per file
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
