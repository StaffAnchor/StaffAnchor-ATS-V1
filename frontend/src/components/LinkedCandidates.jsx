import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CommentsModal from './CommentsModal.jsx';
import CandidateDetailsModal from './CandidateDetailsModal.jsx';
import StatusChangeConfirmDialog from './StatusChangeConfirmDialog.jsx';
import DeleteConfirmationPopup from './DeleteConfirmationPopup.jsx';
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
  Divider,
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
  FilterList as FilterListIcon,
  Comment as CommentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import API_URL from '../config/api';

const LinkedCandidates = ({ open, onClose, jobId, jobTitle, accessLevel }) => {
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlinking, setUnlinking] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleting, setDeleting] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [jobQuestions, setJobQuestions] = useState([]);
  const [clientTrackingToken, setClientTrackingToken] = useState(null);

  // Comments state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedCandidateForComments, setSelectedCandidateForComments] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Replies modal state
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [selectedCandidateForReplies, setSelectedCandidateForReplies] = useState(null);

  // Candidate details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] = useState(null);

  // Status change confirmation state
  const [statusChangeConfirm, setStatusChangeConfirm] = useState({
    open: false,
    linkId: null,
    candidateName: '',
    currentStatus: '',
    newStatus: ''
  });

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
    'Pre-screening',
    'Stage 2 Screening',
    'Shortlisted (Internal)',
    'Not Reachable',
    'Candidate Not Interested',
    'Rejected (Internal)',
    'Submitted to Client'
  ];

  useEffect(() => {
    if (open && jobId) {
      fetchLinkedCandidates();
      fetchJobQuestions();
      setStatusFilter('All');
    }
  }, [open, jobId]);

  // Listen for status changes from RankedCandidatesDisplay
  useEffect(() => {
    if (!open || !jobId) return;
    
    const handleStatusUpdate = (event) => {
      const { linkId, newStatus } = event.detail;
      // Refresh the linked candidates to get the latest status
      fetchLinkedCandidates();
    };

    window.addEventListener('candidateStatusUpdated', handleStatusUpdate);
    return () => {
      window.removeEventListener('candidateStatusUpdated', handleStatusUpdate);
    };
  }, [open, jobId]);

  const fetchJobQuestions = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobQuestions(response.data.personalizedQuestions || []);
      setClientTrackingToken(response.data.clientTrackingToken || null);
    } catch (error) {
      console.error('Error fetching job questions:', error);
      setJobQuestions([]);
      setClientTrackingToken(null);
    }
  };

  const fetchLinkedCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/candidate-job-links/job/${jobId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const candidates = response.data.candidates || [];
      // Ensure clientRounds is always an array
      candidates.forEach(candidate => {
        if (candidate.linkInfo && !candidate.linkInfo.clientRounds) {
          candidate.linkInfo.clientRounds = [];
        }
      });
      setLinkedCandidates(candidates);
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
      await axios.delete(`${API_URL}/api/candidate-job-links/link/${linkId}`, {
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

  const handleDeleteCandidateRequest = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeletePopup(true);
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    try {
      setDeleting(prev => ({ ...prev, [candidateToDelete._id]: true }));
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/candidates/${candidateToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Deleted ${candidateToDelete.name}`);
      // Refresh the list
      fetchLinkedCandidates();
      setShowDeletePopup(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setDeleting(prev => ({ ...prev, [candidateToDelete._id]: false }));
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setCandidateToDelete(null);
  };

  const handleStatusChangeRequest = (linkId, newStatus, candidateName, currentStatus) => {
    setStatusChangeConfirm({
      open: true,
      linkId,
      candidateName,
      currentStatus,
      newStatus
    });
  };

  const handleStatusChangeConfirm = async () => {
    const { linkId, newStatus } = statusChangeConfirm;
    setStatusChangeConfirm({ open: false, linkId: null, candidateName: '', currentStatus: '', newStatus: '' });
    
    try {
      setUpdatingStatus(prev => ({ ...prev, [linkId]: true }));
      const token = localStorage.getItem('jwt');
      await axios.patch(`${API_URL}/api/candidate-job-links/link/${linkId}`, {
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
      
      // Dispatch event to notify RankedCandidatesDisplay
      window.dispatchEvent(new CustomEvent('candidateStatusUpdated', {
        detail: { linkId, newStatus }
      }));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [linkId]: false }));
    }
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
    if (statusLower.includes('submitted to client')) return '#4caf50'; // Green - Submitted to client
    if (statusLower.includes('shortlisted')) return '#8bc34a'; // Light green - Shortlisted
    if (statusLower.includes('stage 2')) return '#2196f3'; // Blue - Stage 2
    if (statusLower.includes('pre-screening') || statusLower.includes('screening')) return '#00bcd4'; // Cyan - Pre-screening
    if (statusLower.includes('applied')) return '#9c27b0'; // Purple - Applied
    if (statusLower.includes('new')) return '#607d8b'; // Blue-grey - New
    if (statusLower.includes('rejected') || statusLower.includes('not interested')) return '#f44336'; // Red - Rejected/Not interested
    if (statusLower.includes('not reachable')) return '#ff9800'; // Orange - Not reachable
    return '#757575'; // Grey - Default
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
      onClose={(event, reason) => {
        // Prevent closing if details modal is open
        if (showDetailsModal) {
          event?.stopPropagation();
          return;
        }
        onClose();
      }}
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

      <DialogContent sx={{ p: 0 }} onClick={(e) => e.stopPropagation()}>
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
                    Contact
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 120
                  }}>
                    Current CTC
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
                    Resume & Reviews
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 200
                  }}>
                    Internal Status
                  </TableCell>
                  <TableCell sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                    minWidth: 180
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Client Status
                      {clientTrackingToken && (
                        <Tooltip title="Open Client Tracking Page">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/client-tracking/${clientTrackingToken}`, '_blank');
                            }}
                            sx={{
                              padding: '2px',
                              color: '#2563eb',
                              '&:hover': {
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              }
                            }}
                          >
                            <OpenInNewIcon sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  {jobQuestions.length > 0 && (
                    <TableCell sx={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderBottom: '2px solid rgba(37, 99, 235, 0.18)',
                      width: 80,
                      textAlign: 'center'
                    }}>
                      Replies
                    </TableCell>
                  )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidateForDetails(candidate);
                      setShowDetailsModal(true);
                    }}
                    sx={{
                      background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                      '&:hover': {
                        background: 'rgba(79, 140, 255, 0.08)',
                        cursor: 'pointer',
                      },
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Checkbox */}
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

                    {/* Contact (Email & Phone) */}
                    <TableCell sx={{ 
                      color: '#64748b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Link
                          href={`mailto:${candidate.email}`}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {candidate.email}
                        </Link>
                        {candidate.phone ? (
                          <Link
                            href={`tel:${candidate.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: '#64748b',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              '&:hover': {
                                color: '#2563eb',
                              }
                            }}
                          >
                            {candidate.phone}
                          </Link>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#7a8a9e', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            Not provided
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Current CTC */}
                    <TableCell sx={{ 
                      color: '#64748b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {candidate.currentCTC 
                          ? `₹ ${candidate.currentCTC} LPA`
                          : (candidate.experience && candidate.experience.length > 0 && candidate.experience[0].ctc)
                            ? `₹ ${candidate.experience[0].ctc} LPA`
                            : 'Not Mentioned'}
                      </Typography>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {candidate.resume && candidate.resume.url ? (
                          <Tooltip title="Download Resume">
                            <IconButton
                              size="small"
                              component="a"
                              href={candidate.resume.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                color: '#2563eb',
                                border: '1px solid rgba(37, 99, 235, 0.18)',
                                padding: '4px',
                                '&:hover': {
                                  backgroundColor: 'rgba(79, 140, 255, 0.1)',
                                  borderColor: '#2563eb',
                                }
                              }}
                            >
                              <DownloadIcon sx={{ fontSize: '1rem' }} />
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
                              padding: '4px',
                              '&:hover': {
                                backgroundColor: 'rgba(79, 140, 255, 0.1)',
                                borderColor: '#2563eb',
                              }
                            }}
                          >
                            <CommentIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
                            handleStatusChangeRequest(
                              candidate.linkInfo.linkId, 
                              e.target.value, 
                              candidate.name,
                              candidate.linkInfo.status || 'New'
                            );
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

                    {/* Client Status */}
                    <TableCell sx={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      py: 2
                    }}>
                      {candidate.linkInfo.status === 'Submitted to Client' ? (
                        (() => {
                          const rounds = candidate.linkInfo.clientRounds || [];
                          // If no rounds exist, show Round 1: Ongoing as default
                          const displayRounds = rounds.length > 0 ? rounds : [{ status: 'Ongoing' }];
                          
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {displayRounds.map((round, idx) => (
                                <Chip
                                  key={idx}
                                  label={`Round ${idx + 1}: ${round.status}`}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    backgroundColor: round.status === 'Accepted' 
                                      ? 'rgba(76, 175, 80, 0.15)' 
                                      : round.status === 'Rejected'
                                      ? 'rgba(244, 67, 54, 0.15)'
                                      : 'rgba(255, 152, 0, 0.15)',
                                    color: round.status === 'Accepted'
                                      ? '#4caf50'
                                      : round.status === 'Rejected'
                                      ? '#f44336'
                                      : '#ff9800',
                                    fontWeight: 600
                                  }}
                                />
                              ))}
                            </Box>
                          );
                        })()
                      ) : (
                        <Typography variant="body2" sx={{ 
                          color: '#94a3b8', 
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          Not submitted to client
                        </Typography>
                      )}
                    </TableCell>

                    {/* Replies */}
                    {jobQuestions.length > 0 && (
                      <TableCell sx={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        py: 2,
                        textAlign: 'center'
                      }}>
                        <Tooltip title="View Question Answers">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidateForReplies(candidate);
                              setShowRepliesModal(true);
                            }}
                            size="small"
                            disabled={!candidate.linkInfo?.questionAnswers || candidate.linkInfo.questionAnswers.length === 0}
                            sx={{
                              color: candidate.linkInfo?.questionAnswers && candidate.linkInfo.questionAnswers.length > 0 
                                ? '#4caf50' 
                                : '#9e9e9e',
                              border: `1px solid ${
                                candidate.linkInfo?.questionAnswers && candidate.linkInfo.questionAnswers.length > 0
                                  ? 'rgba(76, 175, 80, 0.18)'
                                  : 'rgba(158, 158, 158, 0.18)'
                              }`,
                              padding: '4px',
                              '&:hover': {
                                backgroundColor: candidate.linkInfo?.questionAnswers && candidate.linkInfo.questionAnswers.length > 0
                                  ? 'rgba(76, 175, 80, 0.1)'
                                  : 'rgba(158, 158, 158, 0.1)',
                                borderColor: candidate.linkInfo?.questionAnswers && candidate.linkInfo.questionAnswers.length > 0
                                  ? '#4caf50'
                                  : '#9e9e9e',
                              },
                              '&:disabled': {
                                color: '#9e9e9e',
                                borderColor: 'rgba(158, 158, 158, 0.18)',
                              }
                            }}
                          >
                            <QuestionAnswerIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}

                    {/* Actions (Admin only) */}
                    {accessLevel === 2 && (
                      <TableCell sx={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        py: 2,
                        textAlign: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
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
                                padding: '4px',
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
                                <CircularProgress size={16} sx={{ color: '#f44336' }} />
                              ) : (
                                <LinkOffIcon sx={{ fontSize: '1rem' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Candidate">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCandidateRequest(candidate);
                              }}
                              disabled={deleting[candidate._id]}
                              size="small"
                              sx={{
                                color: '#d32f2f',
                                border: '1px solid rgba(211, 47, 47, 0.3)',
                                padding: '4px',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                  borderColor: '#d32f2f',
                                },
                                '&:disabled': {
                                  color: 'rgba(211, 47, 47, 0.3)',
                                  borderColor: 'rgba(211, 47, 47, 0.1)',
                                }
                              }}
                            >
                              {deleting[candidate._id] ? (
                                <CircularProgress size={16} sx={{ color: '#d32f2f' }} />
                              ) : (
                                <DeleteIcon sx={{ fontSize: '1rem' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
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
        justifyContent: 'flex-end',
      }}>
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

    {/* Replies Modal */}
    <Dialog
      open={showRepliesModal}
      onClose={() => {
        setShowRepliesModal(false);
        setSelectedCandidateForReplies(null);
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#1e293b',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QuestionAnswerIcon sx={{ color: '#4caf50', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Question Answers
          </Typography>
        </Box>
        <IconButton
          onClick={() => {
            setShowRepliesModal(false);
            setSelectedCandidateForReplies(null);
          }}
          sx={{
            color: '#64748b',
            '&:hover': {
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogContent sx={{ pt: 3, pb: 2, background: '#ffffff' }}>
        {selectedCandidateForReplies && (
          <>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.95rem' }}>
              Answers provided by <strong>{selectedCandidateForReplies.name}</strong>
            </Typography>
            {selectedCandidateForReplies.linkInfo?.questionAnswers && selectedCandidateForReplies.linkInfo.questionAnswers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedCandidateForReplies.linkInfo.questionAnswers.map((qa, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 2,
                      border: '1px solid #e2e8f0',
                      borderRadius: 1.5,
                      background: '#ffffff'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600,
                      mb: 1,
                      fontSize: '0.95rem'
                    }}>
                      {qa.question}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#475569',
                      fontSize: '0.9rem',
                      pl: 1
                    }}>
                      {qa.answer || 'No answer provided'}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <QuestionAnswerIcon sx={{ fontSize: 64, color: '#9e9e9e', opacity: 0.3, mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  No answers provided for this candidate
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogActions sx={{ p: 2.5, background: '#f8fafc' }}>
        <Button
          onClick={() => {
            setShowRepliesModal(false);
            setSelectedCandidateForReplies(null);
          }}
          variant="outlined"
          sx={{
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Candidate Details Modal */}
    {selectedCandidateForDetails && (
      <CandidateDetailsModal
        open={showDetailsModal}
        onClose={(e) => {
          if (e) e.stopPropagation();
          setShowDetailsModal(false);
          setSelectedCandidateForDetails(null);
        }}
        candidate={selectedCandidateForDetails}
        preferences={null}
        accessLevel={accessLevel}
      />
    )}

    {/* Status Change Confirmation Dialog */}
    <StatusChangeConfirmDialog
      open={statusChangeConfirm.open}
      onClose={() => setStatusChangeConfirm({ open: false, linkId: null, candidateName: '', currentStatus: '', newStatus: '' })}
      onConfirm={handleStatusChangeConfirm}
      title="Confirm Candidate Status Change"
      currentStatus={statusChangeConfirm.currentStatus}
      newStatus={statusChangeConfirm.newStatus}
      itemName={statusChangeConfirm.candidateName}
      itemType="candidate"
    />

    {/* Delete Confirmation Popup */}
    <DeleteConfirmationPopup
      open={showDeletePopup}
      onClose={cancelDelete}
      onConfirm={handleDeleteCandidate}
      title="Delete Candidate"
      message="Are you sure you want to delete this candidate? This action cannot be undone and will also remove all associated data including resume and job links."
      itemName={candidateToDelete?.name}
      isDeleting={candidateToDelete ? deleting[candidateToDelete._id] : false}
    />
    </>
  );
};

export default LinkedCandidates;

