import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CommentsModal from './CommentsModal.jsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Link,
  Tooltip,
  Checkbox,
} from '@mui/material';
import {
  Close as CloseIcon,
  LinkOff as LinkOffIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  PersonAdd as PersonAddIcon,
  Web as WebIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  AccountTree as WorkflowIcon,
  FilterList as FilterListIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

const LinkedCandidates = ({ open, onClose, jobId, jobTitle, accessLevel }) => {
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlinking, setUnlinking] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  // Comments state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedCandidateForComments, setSelectedCandidateForComments] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }
  }, []);

  const statusOptions = [
    'New',
    'Applied',
    'Pre screening',
    'Stage 2 screening',
    'Submitted',
    'Interview',
    'Offered',
    'Offer Rejected',
    'Offer Accepted',
    'Hired',
    'Rejected',
    'Not able to contact',
    'Candidate Not interested'
  ];

  useEffect(() => {
    if (open && jobId) {
      fetchLinkedCandidates();
      setSelectedCandidates([]);
      setStatusFilter('All');
    }
  }, [open, jobId]);

  const fetchLinkedCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`https://staffanchor-ats-v1.onrender.com/api/candidate-job-links/job/${jobId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLinkedCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching linked candidates:', error);
      toast.error('Failed to fetch linked candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkCandidate = async (linkId, candidateName) => {
    try {
      setUnlinking(prev => ({ ...prev, [linkId]: true }));
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://staffanchor-ats-v1.onrender.com/api/candidate-job-links/link/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Unlinked ${candidateName} from job`);
      // Refresh the list
      fetchLinkedCandidates();
    } catch (error) {
      console.error('Error unlinking candidate:', error);
      toast.error('Failed to unlink candidate');
    } finally {
      setUnlinking(prev => ({ ...prev, [linkId]: false }));
    }
  };

  const handleStatusChange = async (linkId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [linkId]: true }));
      const token = localStorage.getItem('jwt');
      await axios.patch(`https://staffanchor-ats-v1.onrender.com/api/candidate-job-links/link/${linkId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setLinkedCandidates(prev => prev.map(candidate => {
        if (candidate.linkInfo.linkId === linkId) {
          return {
            ...candidate,
            linkInfo: {
              ...candidate.linkInfo,
              status: newStatus
            }
          };
        }
        return candidate;
      }));

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [linkId]: false }));
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectAllCandidates = (event) => {
    if (event.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c._id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleCreateWorkflow = () => {
    // Close this modal and navigate to workflows with selected candidates
    const candidatesToPass = selectedCandidates.length > 0 
      ? linkedCandidates.filter(c => selectedCandidates.includes(c._id))
      : linkedCandidates;

    // Store workflow data in sessionStorage to pass to Workflows page
    sessionStorage.setItem('workflowData', JSON.stringify({
      jobId,
      jobTitle,
      candidates: candidatesToPass
    }));

    // Close modal and trigger navigation
    onClose();
    
    // Trigger custom event to navigate to workflows
    window.dispatchEvent(new CustomEvent('createWorkflowFromLinked', {
      detail: {
        jobId,
        jobTitle,
        candidates: candidatesToPass
      }
    }));
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'ai-suggested':
        return <PsychologyIcon sx={{ fontSize: '1rem' }} />;
      case 'applied-through-link':
        return <WebIcon sx={{ fontSize: '1rem' }} />;
      case 'added-by-recruiter':
      case 'manual-link':
        return <PersonAddIcon sx={{ fontSize: '1rem' }} />;
      default:
        return <PersonIcon sx={{ fontSize: '1rem' }} />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'ai-suggested':
        return 'AI Suggested';
      case 'applied-through-link':
        return 'Applied via Link';
      case 'added-by-recruiter':
      case 'manual-link':
        return 'Added by Recruiter';
      default:
        return source;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'ai-suggested':
        return '#2563eb';
      case 'applied-through-link':
        return '#4caf50';
      case 'added-by-recruiter':
      case 'manual-link':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('hired') || statusLower.includes('offer accepted')) return '#4caf50';
    if (statusLower.includes('offered')) return '#8bc34a';
    if (statusLower.includes('interview')) return '#2196f3';
    if (statusLower.includes('submitted') || statusLower.includes('screening')) return '#00bcd4';
    if (statusLower.includes('applied') || statusLower.includes('new')) return '#9c27b0';
    if (statusLower.includes('rejected') || statusLower.includes('not interested')) return '#f44336';
    if (statusLower.includes('not able to contact')) return '#ff9800';
    return '#757575';
  };

  // Filter candidates by status
  const filteredCandidates = linkedCandidates.filter(candidate => {
    if (statusFilter === 'All') return true;
    return candidate.linkInfo.status === statusFilter;
  });

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          maxHeight: '90vh',
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
            Linked Candidates
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {jobTitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedCandidates.length > 0 && (
            <Chip
              label={`${selectedCandidates.length} Selected`}
              sx={{
                backgroundColor: 'rgba(238, 187, 195, 0.3)',
                color: '#8b5cf6',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '2px solid #8b5cf6',
              }}
            />
          )}
          {linkedCandidates.length > 0 && (
            <Chip
              label={`${filteredCandidates.length} of ${linkedCandidates.length}`}
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: '#64748b',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, p: 4 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : linkedCandidates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
            <PersonIcon sx={{ fontSize: 80, color: '#64748b', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>
              No Linked Candidates
            </Typography>
            <Typography variant="body2" sx={{ color: '#7a8a9e' }}>
              No candidates have been linked to this job yet.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Filter Bar */}
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <FilterListIcon sx={{ color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Filter by Status:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    e.stopPropagation();
                    setStatusFilter(e.target.value);
                    setSelectedCandidates([]); // Clear selection when filter changes
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    color: '#1e293b',
                    fontSize: '0.9rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(37, 99, 235, 0.18)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '& .MuiSelect-icon': {
                      color: '#2563eb',
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        '& .MuiMenuItem-root': {
                          color: '#1e293b',
                          '&:hover': {
                            backgroundColor: 'rgba(79, 140, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(238, 187, 195, 0.2)',
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(status),
                          }}
                        />
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {statusFilter !== 'All' && (
                <Chip
                  label="Clear Filter"
                  size="small"
                  onDelete={(e) => {
                    e.stopPropagation();
                    setStatusFilter('All');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    backgroundColor: 'rgba(238, 187, 195, 0.2)',
                    color: '#8b5cf6',
                    '& .MuiChip-deleteIcon': {
                      color: '#8b5cf6',
                      '&:hover': {
                        color: '#1e293b',
                      }
                    }
                  }}
                />
              )}
            </Box>

            <TableContainer sx={{ maxHeight: 'calc(90vh - 240px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                      width: 60,
                      textAlign: 'center'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                        indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < filteredCandidates.length}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectAllCandidates(e);
                        }}
                        sx={{
                          color: '#2563eb',
                          '&.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: '#8b5cf6',
                          },
                        }}
                      />
                    </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 180
                  }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 200
                  }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 140
                  }}>
                    Phone
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 160
                  }}>
                    Source
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 120
                  }}>
                    Resume
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 200
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    width: 80,
                    textAlign: 'center'
                  }}>
                    Comments
                  </TableCell>
                  {accessLevel === 2 && (
                    <TableCell sx={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                      width: 80,
                      textAlign: 'center'
                    }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.map((candidate, index) => (
                  <TableRow
                    key={candidate._id}
                    sx={{
                      background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                      '&:hover': {
                        background: 'rgba(79, 140, 255, 0.08)',
                      },
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2,
                      textAlign: 'center'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedCandidates.includes(candidate._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectCandidate(candidate._id);
                        }}
                        sx={{
                          color: '#2563eb',
                          '&.Mui-checked': {
                            color: '#8b5cf6',
                          },
                        }}
                      />
                    </TableCell>

                    {/* Name */}
                    <TableCell sx={{ 
                      color: '#1e293b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {candidate.name}
                      </Typography>
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ 
                      color: '#64748b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <Link
                        href={`mailto:${candidate.email}`}
                        sx={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        {candidate.email}
                      </Link>
                    </TableCell>

                    {/* Phone */}
                    <TableCell sx={{ 
                      color: '#64748b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      {candidate.phone ? (
                        <Link
                          href={`tel:${candidate.phone}`}
                          sx={{
                            color: '#64748b',
                            textDecoration: 'none',
                            '&:hover': {
                              color: '#2563eb',
                            }
                          }}
                        >
                          {candidate.phone}
                        </Link>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#7a8a9e', fontStyle: 'italic' }}>
                          Not provided
                        </Typography>
                      )}
                    </TableCell>

                    {/* Source */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <Chip
                        icon={getSourceIcon(candidate.linkInfo.source)}
                        label={getSourceLabel(candidate.linkInfo.source)}
                        size="small"
                        sx={{
                          backgroundColor: `${getSourceColor(candidate.linkInfo.source)}20`,
                          color: getSourceColor(candidate.linkInfo.source),
                          borderColor: getSourceColor(candidate.linkInfo.source),
                          border: '1px solid',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          }
                        }}
                      />
                    </TableCell>

                    {/* Resume */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      {candidate.resume && candidate.resume.url ? (
                        <Tooltip title="Download Resume">
                          <IconButton
                            size="small"
                            component="a"
                            href={candidate.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#2563eb',
                              border: '1px solid rgba(37, 99, 235, 0.18)',
                              '&:hover': {
                                backgroundColor: 'rgba(79, 140, 255, 0.1)',
                                borderColor: '#2563eb',
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Chip
                          icon={<DescriptionIcon sx={{ fontSize: '0.9rem' }} />}
                          label="No Resume"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            color: '#ff9800',
                            fontSize: '0.7rem',
                            height: '24px',
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={candidate.linkInfo.status || 'New'}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.linkInfo.linkId, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={updatingStatus[candidate.linkInfo.linkId]}
                          sx={{
                            color: getStatusColor(candidate.linkInfo.status || 'New'),
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: `${getStatusColor(candidate.linkInfo.status || 'New')}40`,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: getStatusColor(candidate.linkInfo.status || 'New'),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: getStatusColor(candidate.linkInfo.status || 'New'),
                            },
                            '& .MuiSelect-icon': {
                              color: getStatusColor(candidate.linkInfo.status || 'New'),
                            },
                            backgroundColor: `${getStatusColor(candidate.linkInfo.status || 'New')}10`,
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                '& .MuiMenuItem-root': {
                                  color: '#1e293b',
                                  '&:hover': {
                                    backgroundColor: 'rgba(79, 140, 255, 0.1)',
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(238, 187, 195, 0.2)',
                                    }
                                  }
                                }
                              }
                            }
                          }}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: getStatusColor(status),
                                  }}
                                />
                                {status}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    {/* Comments */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2,
                      textAlign: 'center'
                    }}>
                      <Tooltip title="View Comments">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidateForComments({
                              _id: candidate._id,
                              name: candidate.name
                            });
                            setShowCommentsModal(true);
                          }}
                          size="small"
                          sx={{
                            color: '#2563eb',
                            border: '1px solid rgba(37, 99, 235, 0.18)',
                            '&:hover': {
                              backgroundColor: 'rgba(79, 140, 255, 0.1)',
                              borderColor: '#2563eb',
                            }
                          }}
                        >
                          <CommentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    {/* Actions (Admin only) */}
                    {accessLevel === 2 && (
                      <TableCell sx={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        py: 2,
                        textAlign: 'center'
                      }}>
                        <Tooltip title="Unlink Candidate">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlinkCandidate(candidate.linkInfo.linkId, candidate.name);
                            }}
                            disabled={unlinking[candidate.linkInfo.linkId]}
                            size="small"
                            sx={{
                              color: '#f44336',
                              border: '1px solid rgba(244, 67, 54, 0.3)',
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderColor: '#f44336',
                              },
                              '&:disabled': {
                                color: 'rgba(244, 67, 54, 0.3)',
                                borderColor: 'rgba(244, 67, 54, 0.1)',
                              }
                            }}
                          >
                            {unlinking[candidate.linkInfo.linkId] ? (
                              <CircularProgress size={18} sx={{ color: '#f44336' }} />
                            ) : (
                              <LinkOffIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <Box>
          {selectedCandidates.length > 0 && (
            <Button
              onClick={handleCreateWorkflow}
              variant="contained"
              startIcon={<WorkflowIcon />}
              sx={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#3d7be8',
                }
              }}
            >
              Create Workflow ({selectedCandidates.length} selected)
            </Button>
          )}
          {selectedCandidates.length === 0 && linkedCandidates.length > 0 && (
            <Button
              onClick={handleCreateWorkflow}
              variant="outlined"
              startIcon={<WorkflowIcon />}
              sx={{
                borderColor: 'rgba(79, 140, 255, 0.5)',
                color: '#2563eb',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(79, 140, 255, 0.1)',
                }
              }}
            >
              Start Workflow for this Job
            </Button>
          )}
        </Box>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#8b5cf6',
            borderColor: 'rgba(238, 187, 195, 0.5)',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              borderColor: '#8b5cf6',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Comments Modal */}
    {selectedCandidateForComments && currentUser && (
      <CommentsModal
        open={showCommentsModal}
        onClose={() => {
          setShowCommentsModal(false);
          setSelectedCandidateForComments(null);
        }}
        candidateId={selectedCandidateForComments._id}
        candidateName={selectedCandidateForComments.name}
        currentUserId={currentUser._id}
        userAccessLevel={accessLevel}
      />
    )}
    </>
  );
};

export default LinkedCandidates;

