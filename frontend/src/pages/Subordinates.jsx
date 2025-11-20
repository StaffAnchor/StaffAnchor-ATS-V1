import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Collapse, 
  Box, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Paper,
  Grid,
  Chip,
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon
} from '@mui/icons-material';
import JobDetails from '../components/JobDetails.jsx';

const Subordinates = ({ user }) => {
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobs, setJobs] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubordinates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const res = await axios.get('https://staffanchor-ats-v1.onrender.com/api/auth/subordinates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubordinates(res.data);
      } catch (error) {
        console.error('Error fetching subordinates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubordinates();
  }, []);

  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setExpandedJobId(null);
    if (!jobs[id]) {
      const token = localStorage.getItem('jwt');
      axios.get('https://staffanchor-ats-v1.onrender.com/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const authorizedJobs = res.data.filter(j => Array.isArray(j.authorizedUsers) && j.authorizedUsers.includes(id));
        setJobs(prev => ({ ...prev, [id]: authorizedJobs }));
      });
    }
  };



  // Accent color for active tab in dark mode
  const getTabStyle = (active) =>
    active
      ? { background: 'var(--color-accent)', color: '#ffffff', fontWeight: 700, border: '2px solid var(--color-accent)' }
      : { background: 'transparent', color: '#1e293b', border: '2px solid #e2e8f0' };

  const handleViewChange = (view) => {
    if (view === 'subordinates') return; // Already on subordinates page
    navigate('/dashboard', { state: { view } });
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAddJob = () => {
    handleCloseMenu();
    navigate('/dashboard', { state: { view: 'addJob' } });
  };

  const handleAddCandidate = () => {
    handleCloseMenu();
    navigate('/dashboard', { state: { view: 'addCandidate' } });
  };

  return (
    <div className="dashboard card" style={{
      maxWidth: '100%', 
      background: 'transparent', 
      boxShadow: 'none', 
      border: 'none', 
      padding: '0 20px'
    }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2em',
        paddingTop: '20px'
      }}>
        <h1>Dashboard</h1>
        <div style={{
          display: 'flex', 
          gap: '1em', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('jobs')}>Jobs</button>}
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('candidates')}>Candidates</button>
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('workflows')}>Workflows</button>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(true)} onClick={() => handleViewChange('subordinates')}>Subordinates</button>}
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('talentPools')}>Talent Pools</button>}
          {user?.accessLevel === 1 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('authorizedJobs')}>Authorized Jobs</button>}
          
          {/* Add button with dropdown - Only for admin */}
          {user?.accessLevel === 2 && (
            <>
              <IconButton
                onClick={handleOpenMenu}
                sx={{
                  backgroundColor: 'transparent',
                  color: '#1e293b',
                  border: '2px solid',
                  borderColor: '#e2e8f0',
                  borderRadius: '4px',
                  width: '40px',
                  height: '40px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    minWidth: '200px',
                    mt: 1
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={handleAddJob}
                  sx={{
                    color: '#1e293b',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <WorkIcon sx={{ color: '#8b5cf6' }} />
                  </ListItemIcon>
                  <ListItemText>Add Job</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={handleAddCandidate}
                  sx={{
                    color: '#1e293b',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText>Add Candidate</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </div>

      {/* Subordinates Content */}
      <Box sx={{ p: 2 }}>
        {/* Loading Screen */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              color: "#64748b",
            }}
          >
            <CircularProgress
              size={60}
              sx={{
                color: "#8b5cf6",
                mb: 3,
              }}
            />
            <Typography variant="h6" sx={{ mb: 1, color: "#1e293b" }}>
              Loading Subordinates...
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Please wait while we fetch your team members
            </Typography>
          </Box>
        ) : subordinates.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: '#64748b'
            }}>
              <GroupIcon sx={{ fontSize: 60, color: '#64748b', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>
                No Subordinates Found
              </Typography>
              <Typography variant="body1">
                You don't have any subordinates assigned yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                borderRadius: 2,
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                      Organization
                    </TableCell>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)" }}>
                      Access Level
                    </TableCell>
                    <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, borderBottom: "2px solid rgba(238, 187, 195, 0.3)", textAlign: "center" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subordinates.map(sub => (
                    <React.Fragment key={sub._id}>
                      <TableRow
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(238, 187, 195, 0.05)",
                          },
                          backgroundColor: expandedId === sub._id ? "rgba(139, 92, 246, 0.08)" : "transparent",
                        }}
                      >
                        <TableCell sx={{ color: "#1e293b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: "#8b5cf6", color: "#f8fafc", width: 40, height: 40 }}>
                              {sub.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontWeight: 600 }}>{sub.fullName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          {sub.email}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          {sub.phone}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          {sub.organization}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          <Chip
                            label="Level 1"
                            size="small"
                            sx={{
                              backgroundColor: "rgba(37, 99, 235, 0.12)",
                              color: "#2563eb",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)", textAlign: "center" }}>
                          <IconButton
                            onClick={() => handleExpand(sub._id)}
                            sx={{
                              color: "#8b5cf6",
                              "&:hover": {
                                backgroundColor: "rgba(238, 187, 195, 0.2)",
                              },
                            }}
                          >
                            {expandedId === sub._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{
                            p: 0,
                            borderBottom: expandedId === sub._id ? "2px solid rgba(238, 187, 195, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <Collapse in={expandedId === sub._id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, background: "rgba(255, 255, 255, 0.02)" }}>
                              <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <WorkIcon sx={{ color: "#8b5cf6", mr: 1 }} />
                                  <Typography variant="h6" sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                    Authorized Jobs
                                  </Typography>
                                </Box>

                                {jobs[sub._id] && jobs[sub._id].length > 0 ? (
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {jobs[sub._id].map(job => (
                                      <Card
                                        key={job._id}
                                        sx={{
                                          background: "rgba(255, 255, 255, 0.05)",
                                          border: "1px solid rgba(0, 0, 0, 0.05)",
                                          borderRadius: 2,
                                        }}
                                      >
                                        <CardContent>
                                          <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600, mb: 0.5 }}>
                                            {job.title}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                                            {job.organization} • {job.location}
                                          </Typography>
                                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                            {job.remote && (
                                              <Chip
                                                label="🌐 Remote"
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                                                  color: "#2563eb",
                                                }}
                                              />
                                            )}
                                            {job.experience && (
                                              <Chip
                                                label={`⏱️ ${job.experience} years`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(238, 187, 195, 0.2)",
                                                  color: "#8b5cf6",
                                                }}
                                              />
                                            )}
                                            {job.ctc && (
                                              <Chip
                                                label={`₹ ${job.ctc} LPA`}
                                                size="small"
                                                sx={{
                                                  backgroundColor: "rgba(255, 193, 7, 0.2)",
                                                  color: "#ffc107",
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      py: 4,
                                      color: "#64748b",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      borderRadius: 2,
                                      border: "1px dashed rgba(0, 0, 0, 0.08)",
                                    }}
                                  >
                                    <WorkIcon sx={{ fontSize: 40, color: "#64748b", mb: 1 }} />
                                    <Typography>No authorized jobs assigned yet</Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </div>
    );
  };

export default Subordinates;
