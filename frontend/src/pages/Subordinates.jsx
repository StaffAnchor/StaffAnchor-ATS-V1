import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Collapse, 
  Box, 
  IconButton, 
  Paper,
  Chip,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Work as WorkIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
  Construction as ConstructionIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import API_URL from '../config/api';

const Subordinates = ({ user }) => {
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobs, setJobs] = useState({});
  const [showJobAuthDialog, setShowJobAuthDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedSubordinateId, setSelectedSubordinateId] = useState(null);
  const [deletingSubordinate, setDeletingSubordinate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subordinateToDelete, setSubordinateToDelete] = useState(null);

  useEffect(() => {
    const fetchSubordinates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${API_URL}/api/auth/subordinates`, {
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
      axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const authorizedJobs = res.data.filter(j => Array.isArray(j.authorizedUsers) && j.authorizedUsers.includes(id));
        setJobs(prev => ({ ...prev, [id]: authorizedJobs }));
      });
    }
  };




  const handleDeleteSubordinate = async () => {
    if (!subordinateToDelete) return;

    try {
      setDeletingSubordinate(subordinateToDelete);
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/auth/subordinates/${subordinateToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubordinates(subordinates.filter(sub => sub._id !== subordinateToDelete));
      toast.success('Subordinate account deleted successfully');
      setSubordinateToDelete(null);
    } catch (error) {
      console.error('Error deleting subordinate:', error);
      toast.error('Failed to delete subordinate account');
    } finally {
      setDeletingSubordinate(null);
    }
  };

  const openDeleteConfirm = (subordinateId) => {
    setSubordinateToDelete(subordinateId);
    setShowDeleteConfirm(true);
  };

  const handleUnlinkJob = async (subordinateId, jobId) => {
    try {
      const token = localStorage.getItem('jwt');
      const job = jobs[subordinateId].find(j => j._id === jobId);
      
      // Remove subordinate from authorized users
      const updatedAuthorizedUsers = (job.authorizedUsers || []).filter(
        userId => userId !== subordinateId
      );
      
      await axios.put(`${API_URL}/api/jobs/${jobId}`, {
        authorizedUsers: updatedAuthorizedUsers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setJobs(prev => ({
        ...prev,
        [subordinateId]: prev[subordinateId].filter(j => j._id !== jobId)
      }));

      toast.success('Job unlinked successfully');
    } catch (error) {
      console.error('Error unlinking job:', error);
      toast.error('Failed to unlink job');
    }
  };

  const handleOpenJobAuthDialog = async (subordinateId) => {
    setSelectedSubordinateId(subordinateId);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllJobs(res.data);
      setShowJobAuthDialog(true);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const handleAuthorizeJob = async (jobId) => {
    try {
      const token = localStorage.getItem('jwt');
      const job = allJobs.find(j => j._id === jobId);
      
      // Check if already authorized
      if (job.authorizedUsers && job.authorizedUsers.includes(selectedSubordinateId)) {
        toast.info('This subordinate is already authorized for this job');
        return;
      }

      // Update job with new authorized user
      const updatedAuthorizedUsers = [...(job.authorizedUsers || []), selectedSubordinateId];
      await axios.put(`${API_URL}/api/jobs/${jobId}`, {
        authorizedUsers: updatedAuthorizedUsers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setJobs(prev => ({
        ...prev,
        [selectedSubordinateId]: [...(prev[selectedSubordinateId] || []), job]
      }));

      toast.success('Job authorized successfully');
      setShowJobAuthDialog(false);
    } catch (error) {
      console.error('Error authorizing job:', error);
      toast.error('Failed to authorize job');
    }
  };

  return (
    <Box sx={{ height: "calc(100vh - 72px)", display: "flex", flexDirection: "column" }}>
      {/* Fixed Header */}
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          top: "72px",
          zIndex: 100,
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          borderRadius: 0,
          p: 3,
          color: "#1e293b",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side - Title */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Subordinate Listings
          </Typography>
        </Box>
      </Paper>

      {/* Subordinates Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          background: "var(--color-bg-dark)",
          p: 2,
        }}
      >
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
                      Analytics
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
                        onClick={() => handleExpand(sub._id)}
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
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            onClick={() => setShowFeatureDialog(true)}
                            sx={{
                              color: "#8b5cf6",
                              backgroundColor: "rgba(139, 92, 246, 0.08)",
                              "&:hover": {
                                backgroundColor: "rgba(139, 92, 246, 0.2)",
                              },
                            }}
                          >
                            <AnalyticsIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
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
                            <IconButton
                              onClick={() => openDeleteConfirm(sub._id)}
                              disabled={deletingSubordinate === sub._id}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                },
                                "&:disabled": {
                                  color: "#9ca3af",
                                }
                              }}
                            >
                              {deletingSubordinate === sub._id ? (
                                <CircularProgress size={20} sx={{ color: "#ef4444" }} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          sx={{
                            p: 0,
                            borderBottom: expandedId === sub._id ? "2px solid rgba(238, 187, 195, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <Collapse in={expandedId === sub._id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, background: "rgba(255, 255, 255, 0.02)" }}>
                              <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <WorkIcon sx={{ color: "#8b5cf6", mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                      Authorized Jobs
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={() => handleOpenJobAuthDialog(sub._id)}
                                    sx={{
                                      backgroundColor: "rgba(139, 92, 246, 0.12)",
                                      color: "#8b5cf6",
                                      "&:hover": {
                                        backgroundColor: "rgba(139, 92, 246, 0.2)",
                                      },
                                    }}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </Box>

                                {jobs[sub._id] && jobs[sub._id].length > 0 ? (
                                  <TableContainer component={Paper} sx={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                    borderRadius: 2,
                                  }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow sx={{ background: "rgba(139, 92, 246, 0.08)" }}>
                                          <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}>
                                            Job Title
                                          </TableCell>
                                          <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}>
                                            Company
                                          </TableCell>
                                          <TableCell sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}>
                                            Location
                                          </TableCell>
                                          <TableCell align="center" sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}>
                                            Status
                                          </TableCell>
                                          <TableCell align="center" sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}>
                                            Actions
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {jobs[sub._id].map(job => (
                                          <TableRow 
                                            key={job._id}
                                            sx={{
                                              "&:hover": {
                                                backgroundColor: "rgba(238, 187, 195, 0.05)",
                                              },
                                            }}
                                          >
                                            <TableCell sx={{ color: "#1e293b", fontWeight: 600 }}>
                                              {job.title}
                                            </TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>
                                              {job.organization}
                                            </TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>
                                              {job.locations && job.locations.length > 0 
                                                ? `${job.locations[0].city || ''}, ${job.locations[0].state || ''}, ${job.locations[0].country || ''}`.replace(/(^,\s*)|(,\s*$)/g, '')
                                                : job.location || 'Not specified'
                                              }
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip
                                                label={job.status || 'New'}
                                                size="small"
                                                sx={{
                                                  backgroundColor: (() => {
                                                    switch (job.status) {
                                                      case 'New': return 'rgba(59, 130, 246, 0.12)';
                                                      case 'In Progress': return 'rgba(245, 158, 11, 0.12)';
                                                      case 'Halted': return 'rgba(239, 68, 68, 0.12)';
                                                      case 'Withdrawn': return 'rgba(107, 116, 128, 0.12)';
                                                      case 'Completed': return 'rgba(16, 185, 129, 0.12)';
                                                      default: return 'rgba(100, 116, 139, 0.12)';
                                                    }
                                                  })(),
                                                  color: (() => {
                                                    switch (job.status) {
                                                      case 'New': return '#3b82f6';
                                                      case 'In Progress': return '#f59e0b';
                                                      case 'Halted': return '#ef4444';
                                                      case 'Withdrawn': return '#6b7280';
                                                      case 'Completed': return '#10b981';
                                                      default: return '#64748b';
                                                    }
                                                  })(),
                                                  fontWeight: 600,
                                                }}
                                              />
                                            </TableCell>
                                            <TableCell align="center">
                                              <Tooltip title="Unlink Job">
                                                <IconButton
                                                  onClick={() => handleUnlinkJob(sub._id, job._id)}
                                                  size="small"
                                                  sx={{
                                                    color: "#ef4444",
                                                    "&:hover": {
                                                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                    },
                                                  }}
                                                >
                                                  <LinkOffIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
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

        {/* Job Authorization Dialog */}
        <Dialog
          open={showJobAuthDialog}
          onClose={() => setShowJobAuthDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ 
            color: "#1e293b", 
            fontWeight: 600,
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#8b5cf6" }}>
              Authorize Job
            </Typography>
            <IconButton onClick={() => setShowJobAuthDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Select a job to authorize this subordinate
            </Typography>
            {allJobs.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <WorkIcon sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
                <Typography sx={{ color: "#64748b" }}>No jobs available</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ 
                maxHeight: 400,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)"
              }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ background: "rgba(139, 92, 246, 0.08)" }}>
                      <TableCell sx={{ color: "#8b5cf6", fontWeight: 700 }}>Job Title</TableCell>
                      <TableCell sx={{ color: "#8b5cf6", fontWeight: 700 }}>Company</TableCell>
                      <TableCell sx={{ color: "#8b5cf6", fontWeight: 700 }}>Location</TableCell>
                      <TableCell align="center" sx={{ color: "#8b5cf6", fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allJobs.map(job => {
                      const isAuthorized = job.authorizedUsers && job.authorizedUsers.includes(selectedSubordinateId);
                      return (
                        <TableRow key={job._id} sx={{
                          "&:hover": {
                            backgroundColor: "rgba(238, 187, 195, 0.05)",
                          },
                        }}>
                          <TableCell sx={{ color: "#1e293b", fontWeight: 600 }}>
                            {job.title}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b" }}>
                            {job.organization}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b" }}>
                            {job.locations && job.locations.length > 0 
                              ? `${job.locations[0].city || ''}, ${job.locations[0].state || ''}`.replace(/(^,\s*)|(,\s*$)/g, '')
                              : job.location || 'Not specified'
                            }
                          </TableCell>
                          <TableCell align="center">
                            {isAuthorized ? (
                              <Chip 
                                label="Authorized" 
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                                  color: "#10b981",
                                  fontWeight: 600,
                                }}
                              />
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAuthorizeJob(job._id)}
                                sx={{
                                  backgroundColor: "#8b5cf6",
                                  color: "#fff",
                                  fontWeight: 600,
                                  textTransform: "none",
                                  "&:hover": {
                                    backgroundColor: "#7c3aed",
                                  },
                                }}
                              >
                                Authorize
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
            <Button 
              onClick={() => setShowJobAuthDialog(false)}
              sx={{
                color: "#64748b",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSubordinateToDelete(null);
          }}
          onConfirm={handleDeleteSubordinate}
          title="Delete Subordinate"
          message="Are you sure you want to delete this subordinate? This will permanently delete their account and cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
    </Box>
  );
};

export default Subordinates;
