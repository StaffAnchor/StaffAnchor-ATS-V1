import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Download as DownloadIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const RankedCandidatesDisplay = ({ open, onClose, jobId, jobTitle, accessLevel, onStatusChange }) => {
  const [streamingText, setStreamingText] = useState('');
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justifyingCandidate, setJustifyingCandidate] = useState(null);
  const [justificationData, setJustificationData] = useState({});
  const [statusChanges, setStatusChanges] = useState({});

  useEffect(() => {
    if (open && jobId) {
      fetchRankedCandidates();
    } else {
      // Reset state when modal closes
      setStreamingText('');
      setRankedCandidates([]);
      setJustificationData({});
      setStatusChanges({});
    }
  }, [open, jobId]);

  // Listen for status changes from LinkedCandidates
  useEffect(() => {
    const handleStatusUpdate = (event) => {
      const { linkId, newStatus } = event.detail;
      // Update the status in ranked candidates if it exists
      setRankedCandidates(prev =>
        prev.map(item =>
          item.linkId === linkId
            ? { ...item, currentStatus: newStatus || 'New' }
            : item
        )
      );
    };

    window.addEventListener('candidateStatusUpdated', handleStatusUpdate);
    return () => {
      window.removeEventListener('candidateStatusUpdated', handleStatusUpdate);
    };
  }, []);

  const fetchRankedCandidates = async () => {
    try {
      setIsLoading(true);
      setStreamingText('');
      setRankedCandidates([]);

      const token = localStorage.getItem('jwt');
      const response = await axios.post(
        `${API_URL}/api/jobs/${jobId}/rank-linked-candidates`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Simulate streaming text for summary
        const summary = response.data.summary || 'Ranking completed.';
        await streamText(summary, setStreamingText);
        
        // Then display candidates
        setRankedCandidates(response.data.rankedCandidates || []);
        toast.success(`Ranked ${response.data.rankedCandidates.length} candidates`);
      }
    } catch (error) {
      console.error('Error fetching ranked candidates:', error);
      if (error.response?.status === 429) {
        toast.error('AI service is busy. Please try again in a minute.');
      } else {
        toast.error('Failed to rank candidates');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const streamText = async (text, setter) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setter(currentText);
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
    }
  };

  const handleJustifyRanking = async (candidateId) => {
    if (justificationData[candidateId]) {
      // Toggle if already loaded
      setJustifyingCandidate(justifyingCandidate === candidateId ? null : candidateId);
      return;
    }

    try {
      setJustifyingCandidate(candidateId);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(
        `${API_URL}/api/jobs/${jobId}/justify-candidate/${candidateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setJustificationData(prev => ({
          ...prev,
          [candidateId]: {
            merits: response.data.merits || [],
            demerits: response.data.demerits || [],
            finalVerdict: response.data.finalVerdict || []
          }
        }));
      }
    } catch (error) {
      console.error('Error getting justification:', error);
      if (error.response?.status === 429) {
        toast.error('AI service is busy. Please try again in a minute.');
      } else {
        toast.error('Failed to get justification');
      }
      setJustifyingCandidate(null);
    }
  };

  const handleStatusChange = async (linkId, candidateId, newStatus) => {
    try {
      setStatusChanges(prev => ({ ...prev, [linkId]: true }));
      const token = localStorage.getItem('jwt');
      await axios.patch(
        `${API_URL}/api/candidate-job-links/link/${linkId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state - ensure status is always set
      setRankedCandidates(prev =>
        prev.map(item =>
          item.linkId === linkId
            ? { ...item, currentStatus: newStatus || 'New' }
            : item
        )
      );

      toast.success('Status updated successfully');
      
      // Dispatch event to notify LinkedCandidates
      window.dispatchEvent(new CustomEvent('candidateStatusUpdated', {
        detail: { linkId, newStatus, candidateId }
      }));
      
      if (onStatusChange) {
        onStatusChange(candidateId, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setStatusChanges(prev => ({ ...prev, [linkId]: false }));
    }
  };

  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast.warning('No resume available');
    }
  };

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

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onClose();
        }
      }}
      maxWidth="lg"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          pb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
          AI-Ranked Candidates for: {jobTitle}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }} onClick={(e) => e.stopPropagation()}>
        {isLoading && rankedCandidates.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              minHeight: '400px',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderRadius: 2
            }}
          >
            {/* Animated background particles */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  top: '20%',
                  left: '20%',
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.5)', opacity: 0.8 }
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  bottom: '20%',
                  right: '20%',
                  animation: 'pulse 2.5s ease-in-out infinite',
                  animationDelay: '0.5s'
                }
              }}
            />

            {/* Main loading animation */}
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                mb: 4,
                zIndex: 1
              }}
            >
              {/* Outer rotating ring */}
              <CircularProgress
                variant="indeterminate"
                size={120}
                thickness={3}
                sx={{
                  position: 'absolute',
                  color: '#2563eb',
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
              {/* Middle rotating ring */}
              <CircularProgress
                variant="indeterminate"
                size={90}
                thickness={3}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#8b5cf6',
                  animation: 'spinReverse 1.5s linear infinite',
                  '@keyframes spinReverse': {
                    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                  }
                }}
              />
              {/* Inner pulsing circle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulseInner 1.5s ease-in-out infinite',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
                  '@keyframes pulseInner': {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.8 }
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  AI
                </Typography>
              </Box>
            </Box>

            {/* Animated dots */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mb: 3,
                zIndex: 1
              }}
            >
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                    animation: 'bounce 1.4s ease-in-out infinite',
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)',
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.7 },
                      '40%': { transform: 'translateY(-10px)', opacity: 1 }
                    }
                  }}
                />
              ))}
            </Box>

            {/* Text with gradient effect */}
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
                fontSize: '1.5rem',
                zIndex: 1,
                animation: 'fadeInOut 2s ease-in-out infinite',
                '@keyframes fadeInOut': {
                  '0%, 100%': { opacity: 0.8 },
                  '50%': { opacity: 1 }
                }
              }}
            >
              AI is analyzing candidates...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                zIndex: 1,
                textAlign: 'center',
                maxWidth: '400px',
                animation: 'fadeInOut 2s ease-in-out infinite',
                animationDelay: '0.3s'
              }}
            >
              Processing profiles and matching them with job requirements
            </Typography>

            {/* Scanning line effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #2563eb 50%, transparent 100%)',
                animation: 'scan 2s linear infinite',
                '@keyframes scan': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(400px)' }
                }
              }}
            />
          </Box>
        ) : (
          <>
            {streamingText && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  background: 'rgba(37, 99, 235, 0.1)',
                  borderRadius: 1,
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}
              >
                <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600, mb: 1 }}>
                  AI Analysis Summary:
                </Typography>
                <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.7 }}>
                  {streamingText}
                  {isLoading && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
                </Typography>
              </Box>
            )}

            {rankedCandidates.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: '60vh' }} onClick={(e) => e.stopPropagation()}>
                <Table stickyHeader onClick={(e) => e.stopPropagation()}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Relevance Score</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Resume</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>Internal Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, background: '#f8fafc' }}>AI Justification</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rankedCandidates.map((item, index) => {
                      const candidate = item.candidate;
                      const showingJustification = justifyingCandidate === candidate._id;
                      const justification = justificationData[candidate._id] || null;

                      return (
                        <React.Fragment key={item.linkId}>
                          <TableRow onClick={(e) => e.stopPropagation()}>
                            <TableCell>
                              <Chip
                                label={`#${item.rank}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {candidate.name || 'Unknown'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                  {candidate.email || 'No email'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                  {candidate.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${item.relevanceScore}%`}
                                color={item.relevanceScore >= 80 ? 'success' : item.relevanceScore >= 60 ? 'warning' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {candidate.resume && candidate.resume.url ? (
                                <Tooltip title="Download Resume">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadResume(candidate.resume.url);
                                    }}
                                    sx={{ color: '#2563eb' }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Chip label="No Resume" size="small" color="default" />
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                  value={item.currentStatus && item.currentStatus.trim() !== '' ? item.currentStatus : 'New'}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(item.linkId, candidate._id, e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onOpen={(e) => e.stopPropagation()}
                                  disabled={statusChanges[item.linkId]}
                                  sx={{ fontSize: '0.875rem' }}
                                  MenuProps={{
                                    onClick: (e) => e.stopPropagation(),
                                    onClose: (e) => e.stopPropagation()
                                  }}
                                >
                                  {statusOptions.map(status => (
                                    <MenuItem 
                                      key={status} 
                                      value={status}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {status}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="Ask AI to justify ranking">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJustifyRanking(candidate._id);
                                  }}
                                  disabled={justifyingCandidate === candidate._id && !justification}
                                  sx={{
                                    color: justification ? '#2563eb' : '#64748b',
                                    '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.08)' }
                                  }}
                                >
                                  {justifyingCandidate === candidate._id && !justification ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <QuestionAnswerIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                          {showingJustification && justification && (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ py: 3, background: 'rgba(37, 99, 235, 0.05)' }}>
                                <Box sx={{ pl: 2, pr: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#2563eb', fontWeight: 700, fontSize: '1.1rem' }}>
                                    AI Justification
                                  </Typography>
                                  
                                  {/* Merits Section */}
                                  <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                                      Merits
                                    </Typography>
                                    <List dense>
                                      {(justification.merits || []).map((merit, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5, pl: 3 }}>
                                          <ListItemText
                                            primary={
                                              <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.6 }}>
                                                • {merit}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>

                                  <Divider sx={{ my: 2 }} />

                                  {/* Demerits Section */}
                                  <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                      Demerits
                                    </Typography>
                                    <List dense>
                                      {(justification.demerits || []).map((demerit, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5, pl: 3 }}>
                                          <ListItemText
                                            primary={
                                              <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.6 }}>
                                                • {demerit}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>

                                  <Divider sx={{ my: 2 }} />

                                  {/* Final Verdict Section */}
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                                      Final Verdict
                                    </Typography>
                                    <List dense>
                                      {(justification.finalVerdict || []).map((verdict, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5, pl: 3 }}>
                                          <ListItemText
                                            primary={
                                              <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>
                                                • {verdict}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  No ranked candidates to display
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }} onClick={(e) => e.stopPropagation()}>
        <Button onClick={(e) => { e.stopPropagation(); onClose(); }} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RankedCandidatesDisplay;

