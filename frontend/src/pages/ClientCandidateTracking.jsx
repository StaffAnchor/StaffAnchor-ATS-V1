import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Chip,
  TextField,
} from '@mui/material';
import { Add as AddIcon, CloudDownload as CloudDownloadIcon, Check as CheckIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from '../config/api';
import staffAnchorLogo from '../assets/StaffanchorLogoFinalSVG.svg';

const ClientCandidateTracking = () => {
  const { trackingToken } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState(1); // Default to 1 round

  useEffect(() => {
    const fetchJobAndCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/client-tracking/candidates/${trackingToken}`);
        setJobTitle(res.data.jobTitle);

        // Initialize clientRounds for each candidate if not present
        const initializedCandidates = res.data.candidates.map(candidate => ({
          ...candidate,
          clientRounds: candidate.clientRounds && candidate.clientRounds.length > 0
            ? candidate.clientRounds
            : Array(rounds).fill({ status: 'Ongoing', feedback: '' })
        }));
        setCandidates(initializedCandidates);
        setRounds(Math.max(rounds, ...initializedCandidates.map(c => c.clientRounds.length)));

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load job or candidate data.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndCandidates();
  }, [trackingToken]);

  const handleStatusChange = async (candidateJobLinkId, newStatus, roundIndex) => {
    try {
      // Optimistically update UI
      setCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.candidateJobLinkId === candidateJobLinkId
            ? {
                ...candidate,
                clientRounds: candidate.clientRounds?.map((round, idx) =>
                  idx === roundIndex ? { ...round, status: newStatus } : round
                ) || [{ status: newStatus, feedback: '' }]
              }
            : candidate
        )
      );

      await axios.put(`${API_URL}/api/client-tracking/candidate-status/${candidateJobLinkId}`, { roundIndex, status: newStatus });
      toast.success('Status updated!');
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Failed to update status.');
      // Revert optimistic update by re-fetching data
      const fetchJobAndCandidates = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/client-tracking/candidates/${trackingToken}`);
          setJobTitle(res.data.jobTitle);
          const initializedCandidates = res.data.candidates.map(candidate => ({
            ...candidate,
            clientRounds: candidate.clientRounds && candidate.clientRounds.length > 0
              ? candidate.clientRounds
              : Array(rounds).fill({ status: 'Ongoing', feedback: '' })
          }));
          setCandidates(initializedCandidates);
          setRounds(Math.max(rounds, ...initializedCandidates.map(c => c.clientRounds.length)));
        } catch (err) {
          console.error('Error re-fetching data after update failure:', err);
          toast.error('Failed to re-load job or candidate data after update failure.');
        }
      };
      fetchJobAndCandidates();
    }
  };

  // Handle feedback input change (local state only, not saved)
  const handleFeedbackInputChange = (candidateJobLinkId, newFeedback, roundIndex) => {
    setCandidates(prevCandidates =>
      prevCandidates.map(candidate =>
        candidate.candidateJobLinkId === candidateJobLinkId
          ? {
              ...candidate,
              clientRounds: candidate.clientRounds?.map((round, idx) =>
                idx === roundIndex ? { ...round, feedback: newFeedback } : round
              ) || [{ status: 'Ongoing', feedback: newFeedback }]
            }
          : candidate
      )
    );
  };

  // Handle feedback save (saves to backend)
  const handleFeedbackSave = async (candidateJobLinkId, roundIndex) => {
    try {
      const candidate = candidates.find(c => c.candidateJobLinkId === candidateJobLinkId);
      const feedback = candidate?.clientRounds?.[roundIndex]?.feedback || '';

      await axios.put(`${API_URL}/api/client-tracking/candidate-status/${candidateJobLinkId}`, { 
        roundIndex, 
        feedback: feedback 
      });
      toast.success('Feedback saved!');
    } catch (error) {
      console.error('Error saving candidate feedback:', error);
      toast.error('Failed to save feedback.');
      // Revert by re-fetching data
      const fetchJobAndCandidates = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/client-tracking/candidates/${trackingToken}`);
          setJobTitle(res.data.jobTitle);
          const initializedCandidates = res.data.candidates.map(candidate => ({
            ...candidate,
            clientRounds: candidate.clientRounds && candidate.clientRounds.length > 0
              ? candidate.clientRounds
              : Array(rounds).fill({ status: 'Ongoing', feedback: '' })
          }));
          setCandidates(initializedCandidates);
          setRounds(Math.max(rounds, ...initializedCandidates.map(c => c.clientRounds.length)));
        } catch (err) {
          console.error('Error re-fetching data after save failure:', err);
          toast.error('Failed to re-load job or candidate data after save failure.');
        }
      };
      fetchJobAndCandidates();
    }
  };

  const addRound = () => {
    setRounds(prevRounds => prevRounds + 1);
    setCandidates(prevCandidates =>
      prevCandidates.map(candidate => ({
        ...candidate,
        clientRounds: [...(candidate.clientRounds || []), { status: 'Ongoing', feedback: '' }]
      }))
    );
  };

  const deleteRound = async (roundIndex) => {
    if (rounds <= 1) {
      toast.error('At least one round is required');
      return;
    }

    if (roundIndex === 0) {
      toast.error('Cannot delete the first round');
      return;
    }

    try {
      // Calculate updated rounds for each candidate before updating state
      const updatedCandidates = candidates.map(candidate => {
        const updatedRounds = [...(candidate.clientRounds || [])];
        updatedRounds.splice(roundIndex, 1);
        return {
          ...candidate,
          clientRounds: updatedRounds
        };
      });

      // Update backend for each candidate by sending the entire updated clientRounds array
      const updatePromises = updatedCandidates.map(async (candidate) => {
        try {
          await axios.put(`${API_URL}/api/client-tracking/candidate-status/${candidate.candidateJobLinkId}`, {
            clientRounds: candidate.clientRounds
          });
        } catch (err) {
          console.error(`Error updating rounds for candidate ${candidate.candidateJobLinkId}:`, err);
          throw err;
        }
      });

      await Promise.all(updatePromises);

      // Update local state only after successful backend update
      setRounds(prevRounds => prevRounds - 1);
      setCandidates(updatedCandidates);
      
      toast.success('Round deleted successfully');
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('Failed to delete round');
      // Revert by re-fetching data
      const fetchJobAndCandidates = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/client-tracking/candidates/${trackingToken}`);
          setJobTitle(res.data.jobTitle);
          const initializedCandidates = res.data.candidates.map(candidate => ({
            ...candidate,
            clientRounds: candidate.clientRounds && candidate.clientRounds.length > 0
              ? candidate.clientRounds
              : Array(rounds).fill({ status: 'Ongoing', feedback: '' })
          }));
          setCandidates(initializedCandidates);
          setRounds(Math.max(rounds, ...initializedCandidates.map(c => c.clientRounds.length)));
        } catch (err) {
          console.error('Error re-fetching data after delete failure:', err);
          toast.error('Failed to re-load data after delete failure.');
        }
      };
      fetchJobAndCandidates();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!jobTitle) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#1e293b', gap: 2 }}>
        <Typography variant="h5" sx={{ color: '#1e293b' }}>Job not found</Typography>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          This job posting may have been removed or does not exist.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: { xs: 1, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <ToastContainer position="top-center" autoClose={3000} theme="light" />

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header with StaffAnchor Branding, Job Name, and Company */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1, sm: 2 },
          textAlign: { xs: 'center', sm: 'left' },
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          p: { xs: 2, sm: 3, md: 4 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <img
              src={staffAnchorLogo}
              alt="StaffAnchor Logo"
              style={{
                height: '40px',
                width: 'auto',
                marginRight: '15px',
                filter: 'brightness(0) invert(1)' // Makes the logo white for dark background
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#94a3b8', fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, display: { xs: 'none', sm: 'block' } }}>
              StaffAnchor
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff', fontSize: { xs: '1.6rem', sm: '2rem', md: '2.5rem' } }}>
              {jobTitle}
            </Typography>
          </Box>
        </Box>

        <Paper sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: 'none',
          overflow: 'hidden', // Hide scrollbars by default and let TableContainer handle it
        }}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}> {/* Adjusted height for vertical scroll */}
              <Table stickyHeader aria-label="candidate tracking table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 150, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>Name</TableCell>
                    <TableCell sx={{ minWidth: 120, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>Resume</TableCell>
                    <TableCell sx={{ minWidth: 150, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>Email</TableCell>
                    <TableCell sx={{ minWidth: 120, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>Phone</TableCell>
                    {[...Array(rounds)].map((_, i) => (
                      <React.Fragment key={i}>
                        <TableCell sx={{ minWidth: 180, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>Round {i + 1} Status</span>
                            {i > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => deleteRound(i)}
                                sx={{
                                  color: '#ef4444',
                                  padding: '2px',
                                  '&:hover': {
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  }
                                }}
                                title="Delete this round"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 250, fontWeight: 'bold', backgroundColor: '#f0f0f0', zIndex: 1 }}>Round {i + 1} Feedback</TableCell>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4 + rounds * 2} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No candidates with "Submitted to client" status.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate, index) => (
                      <TableRow key={candidate._id} sx={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{candidate.name}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                          {candidate.resume?.url ? (
                            <Button
                              variant="outlined"
                              size="small"
                              href={candidate.resume.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<CloudDownloadIcon />}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, padding: { xs: '4px 8px', sm: '6px 12px' } }}
                            >
                              Resume
                            </Button>
                          ) : (
                            <Chip label="N/A" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{candidate.email}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{candidate.phone}</TableCell>
                        {[...Array(rounds)].map((_, i) => (
                          <React.Fragment key={`${candidate._id}-${i}`}>
                            <TableCell>
                              <Select
                                value={candidate.clientRounds?.[i]?.status || 'Ongoing'}
                                onChange={(e) => handleStatusChange(candidate.candidateJobLinkId, e.target.value, i)}
                                displayEmpty
                                size="small"
                                sx={{ minWidth: 120, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                <MenuItem value="Ongoing">Ongoing (by default)</MenuItem>
                                <MenuItem value="Accepted">Accepted</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <TextField
                                  multiline
                                  rows={1}
                                  fullWidth
                                  value={candidate.clientRounds?.[i]?.feedback || ''}
                                  placeholder="Add feedback"
                                  onChange={(e) => handleFeedbackInputChange(candidate.candidateJobLinkId, e.target.value, i)}
                                  size="small"
                                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleFeedbackSave(candidate.candidateJobLinkId, i)}
                                  sx={{
                                    color: '#10b981',
                                    padding: '4px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    }
                                  }}
                                  title="Save feedback"
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))
                  )
                }
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pr: { xs: 0, sm: 2 } }}> {/* Add pr for right padding to align with table */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addRound}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, padding: { xs: '8px 12px', sm: '10px 15px' } }}
              >
                Add Another Round
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ClientCandidateTracking;
