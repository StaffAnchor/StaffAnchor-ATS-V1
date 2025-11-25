import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  Chip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';

const ClientSideStatusCreation = ({ open, onClose, preSelectedJobId, user }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(preSelectedJobId || '');
  const [submittedCandidates, setSubmittedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [existingWorkflow, setExistingWorkflow] = useState(null);

  useEffect(() => {
    if (open) {
      fetchJobs();
      if (preSelectedJobId) {
        setSelectedJobId(preSelectedJobId);
      }
    }
  }, [open, preSelectedJobId]);

  useEffect(() => {
    if (selectedJobId) {
      fetchSubmittedCandidates(selectedJobId);
    } else {
      setSubmittedCandidates([]);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    }
  };

  const fetchSubmittedCandidates = async (jobId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      
      // Fetch candidates
      const candidatesResponse = await axios.get(`${API_URL}/api/candidate-job-links/job/${jobId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check if workflow exists for this job
      const workflowResponse = await axios.get(`${API_URL}/api/workflows/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeWorkflow = workflowResponse.data.find(w => w.status === 'Active');
      setExistingWorkflow(activeWorkflow || null);

      // Filter only "Submitted to Client" candidates
      let submitted = candidatesResponse.data.candidates.filter(
        c => c.linkInfo?.status === 'Submitted to Client'
      );

      // If workflow exists, filter out candidates already in it
      if (activeWorkflow) {
        const existingCandidateIds = new Set();
        activeWorkflow.candidateStatuses?.forEach(cs => {
          existingCandidateIds.add(cs.candidateId?._id?.toString() || cs.candidateId?.toString());
        });
        submitted = submitted.filter(c => !existingCandidateIds.has(c._id.toString()));
      }

      setSubmittedCandidates(submitted);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job');
      return;
    }

    if (submittedCandidates.length === 0) {
      toast.error('No candidates submitted to client for this job');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('jwt');
      
      const selectedJob = jobs.find(j => j._id === selectedJobId);
      
      // Create workflow with phases structure (backend expects this)
      const workflowData = {
        jobId: selectedJobId,
        phases: [{
          phaseNumber: 0,
          phaseName: 'Client Process',
          type: 'Custom',
          status: 'Active',
          candidates: submittedCandidates.map(c => c._id),
          customFields: [],
          notes: 'Client side candidate tracking'
        }],
        description: `Client side tracking for ${selectedJob.title}`,
        userId: user._id
      };

      const response = await axios.post(`${API_URL}/api/workflows`, workflowData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show appropriate success message based on whether workflow was created or updated
      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Client side status tracking started successfully!');
      }
      onClose(true); // Pass true to indicate workflow was created/updated
    } catch (error) {
      console.error('Error creating workflow:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to create client side tracking');
      }
    } finally {
      setCreating(false);
    }
  };

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon sx={{ color: '#8b5cf6', fontSize: '1.5rem' }} />
          <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700 }}>
            Create Client Side Status Tracking
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
          Select a job to track candidates submitted to the client
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Job Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: '#64748b' }}>Select Job</InputLabel>
          <Select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            label="Select Job"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6', borderWidth: '2px' },
            }}
          >
            <MenuItem value="">Select a job</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job._id} value={job._id}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {job.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {job.organization}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Job Info */}
        {selectedJob && (
          <Paper sx={{ p: 2, mb: 3, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <WorkIcon sx={{ color: '#8b5cf6' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  {selectedJob.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: '0.9rem' }} />
                  {selectedJob.organization}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Candidates List */}
        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
            Loading candidates...
          </Typography>
        ) : selectedJobId ? (
          submittedCandidates.length > 0 ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  {existingWorkflow ? 'New Candidates to Track' : 'Candidates Submitted to Client'}
                </Typography>
                <Chip
                  label={`${submittedCandidates.length} Candidate${submittedCandidates.length !== 1 ? 's' : ''}`}
                  sx={{
                    backgroundColor: 'rgba(76, 175, 80, 0.12)',
                    color: '#4caf50',
                    fontWeight: 600
                  }}
                />
              </Box>
              {existingWorkflow && (
                <Paper sx={{ p: 2, mb: 2, background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                    ℹ️ A client side process already exists for this job. Only newly submitted candidates are shown below.
                  </Typography>
                </Paper>
              )}
              <TableContainer component={Paper} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                      <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Phone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submittedCandidates.map((candidate) => (
                      <TableRow key={candidate._id}>
                        <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                          {candidate.name}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b' }}>
                          {candidate.email}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b' }}>
                          {candidate.phone || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
              <PersonIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 0.5 }}>
                No Candidates Submitted to Client
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Mark candidates as "Submitted to Client" in the job's linked candidates first
              </Typography>
            </Paper>
          )
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(0, 0, 0, 0.02)' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Select a job to view submitted candidates
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)', px: 3, py: 2 }}>
        <Button
          onClick={() => onClose(false)}
          sx={{ color: '#64748b' }}
        >
          Cancel
        </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!selectedJobId || submittedCandidates.length === 0 || creating}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {creating ? (existingWorkflow ? 'Adding...' : 'Creating...') : (existingWorkflow ? 'Add to Existing Tracking' : 'Start Tracking')}
          </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientSideStatusCreation;

