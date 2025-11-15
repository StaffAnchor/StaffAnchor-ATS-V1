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
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import JobDetails from '../components/JobDetails.jsx';

const Subordinates = ({ user }) => {
  const [subordinates, setSubordinates] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobs, setJobs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    axios.get('https://staffanchor-ats-v1.onrender.com/api/auth/subordinates', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSubordinates(res.data));
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
      ? { background: 'var(--color-accent)', color: '#232946', fontWeight: 700, border: '2px solid var(--color-accent)' }
      : { background: 'transparent', color: '#f5f7fa', border: '2px solid #444' };

  const handleViewChange = (view) => {
    if (view === 'subordinates') return; // Already on subordinates page
    navigate('/dashboard', { state: { view } });
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
          flexWrap: 'wrap'
        }}>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('jobs')}>Jobs</button>}
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('candidates')}>Candidates</button>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('addJob')}>Add Job</button>}
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('addCandidate')}>Add Candidate</button>}
          <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('workflows')}>Workflows</button>
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(true)} onClick={() => handleViewChange('subordinates')}>Subordinates</button>}
          {user?.accessLevel === 2 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('talentPools')}>Talent Pools</button>}
          {user?.accessLevel === 1 && <button className="button" style={getTabStyle(false)} onClick={() => handleViewChange('authorizedJobs')}>Authorized Jobs</button>}
        </div>
      </div>

      {/* Subordinates Content */}
      <Box sx={{ 
        maxWidth: 1000, 
        mx: 'auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <GroupIcon sx={{ fontSize: 40, color: '#eebbc3', mr: 2 }} />
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#f5f7fa',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #eebbc3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Subordinates Management
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#b8c5d6', fontSize: '1.1rem' }}>
            Manage and monitor your team members and their authorized job access
          </Typography>
        </Box>

        <Paper elevation={0} sx={{
          background: 'transparent',
          p: 4,
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {subordinates.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: '#b8c5d6'
            }}>
              <GroupIcon sx={{ fontSize: 60, color: '#b8c5d6', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>
                No Subordinates Found
              </Typography>
              <Typography variant="body1">
                You don't have any subordinates assigned yet.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ color: '#eebbc3', mr: 1 }} />
                <Typography variant="h5" sx={{ color: '#eebbc3', fontWeight: 600 }}>
                  Team Members ({subordinates.length})
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {subordinates.map(sub => (
                  <Grid item xs={12} key={sub._id}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        borderColor: 'rgba(238, 187, 195, 0.3)',
                      }
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Subordinate Header */}
                        <Box 
                          onClick={() => handleExpand(sub._id)}
                          sx={{
                            p: 3,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: expandedId === sub._id ? '1px solid rgba(238, 187, 195, 0.3)' : 'none',
                            background: expandedId === sub._id ? 'rgba(238, 187, 195, 0.05)' : 'transparent'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: '#eebbc3', 
                              color: '#1a1a2e',
                              mr: 2,
                              width: 56,
                              height: 56,
                              fontSize: '1.5rem',
                              fontWeight: 700
                            }}>
                              {sub.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                color: '#f5f7fa', 
                                fontWeight: 700,
                                mb: 0.5
                              }}>
                                {sub.fullName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon sx={{ color: '#b8c5d6', fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                                    {sub.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PhoneIcon sx={{ color: '#b8c5d6', fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                                    {sub.phone}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BusinessIcon sx={{ color: '#b8c5d6', fontSize: 16 }} />
                                <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                                  {sub.organization}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                              label="Level 1 Access" 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(79, 140, 255, 0.2)', 
                                color: '#4f8cff',
                                fontWeight: 600
                              }} 
                            />
                            <IconButton 
                              sx={{ 
                                color: '#eebbc3',
                                backgroundColor: 'rgba(238, 187, 195, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(238, 187, 195, 0.2)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              {expandedId === sub._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Expanded Content */}
                        <Collapse in={expandedId === sub._id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, background: 'rgba(255, 255, 255, 0.02)' }}>
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <WorkIcon sx={{ color: '#eebbc3', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 600 }}>
                                  Authorized Jobs
                                </Typography>
                              </Box>
                              
                              {jobs[sub._id] && jobs[sub._id].length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {jobs[sub._id].map(job => (
                                    <Card key={job._id} sx={{
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        borderColor: 'rgba(238, 187, 195, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                      }
                                    }}>
                                      <CardContent sx={{ p: 0 }}>
                                        <Box 
                                          sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                          }}
                                        >
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ 
                                              color: '#f5f7fa', 
                                              fontWeight: 600,
                                              mb: 0.5
                                            }}>
                                              {job.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                                              {job.organization} • {job.location}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                              {job.remote && (
                                                <Chip 
                                                  label="🌐 Remote" 
                                                  size="small" 
                                                  sx={{ 
                                                    backgroundColor: 'rgba(79, 140, 255, 0.2)', 
                                                    color: '#4f8cff',
                                                    fontSize: '0.7rem'
                                                  }} 
                                                />
                                              )}
                                              {job.experience && (
                                                <Chip 
                                                  label={`⏱️ ${job.experience} years`} 
                                                  size="small" 
                                                  sx={{ 
                                                    backgroundColor: 'rgba(238, 187, 195, 0.2)', 
                                                    color: '#eebbc3',
                                                    fontSize: '0.7rem'
                                                  }} 
                                                />
                                              )}
                                              {job.ctc && (
                                                <Chip 
                                                  label={`₹ ${job.ctc}`} 
                                                  size="small" 
                                                  sx={{ 
                                                    backgroundColor: 'rgba(255, 193, 7, 0.2)', 
                                                    color: '#ffc107',
                                                    fontSize: '0.7rem'
                                                  }} 
                                                />
                                              )}
                                            </Box>
                                          </Box>

                                        </Box>
                                        
                                        <JobDetails 
                                          job={job} 
                                          userId={sub._id} 
                                          accessLevel={1}
                                          expanded={expandedJobId === job._id}
                                          onExpandClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                                        />
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              ) : (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  py: 4,
                                  color: '#b8c5d6',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: 2,
                                  border: '1px dashed rgba(255, 255, 255, 0.2)'
                                }}>
                                  <WorkIcon sx={{ fontSize: 40, color: '#b8c5d6', mb: 1 }} />
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    No Jobs Authorized
                                  </Typography>
                                  <Typography variant="body2">
                                    This subordinate doesn't have access to any jobs yet.
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default Subordinates; 