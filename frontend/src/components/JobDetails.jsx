import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CandidateList from './CandidateList.jsx';
import ResultsLimitPopup from './ResultsLimitPopup.jsx';
import DeleteConfirmationPopup from './DeleteConfirmationPopup.jsx';
import PreferenceSelectionModal from './PreferenceSelectionModal.jsx';
import CandidateDetailsModal from './CandidateDetailsModal.jsx';
import LinkedCandidates from './LinkedCandidates.jsx';
import AIWarningDialog from './AIWarningDialog.jsx';
import CompanyNameVisibilityModal from './CompanyNameVisibilityModal.jsx';
import StatusChangeConfirmDialog from './StatusChangeConfirmDialog.jsx';
import { toast } from 'react-toastify';
import { Typography, Button, Box, TextField, Checkbox, FormControlLabel, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Paper, Switch, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Chip, Divider, Grid, IconButton, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Share as ShareIcon, People as PeopleIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import API_URL from '../config/api';

const JobDetails = ({ job, userId, accessLevel, expanded, onExpandClick }) => {
  const navigate = useNavigate();
  const [showCandidates, setShowCandidates] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editJob, setEditJob] = useState({ ...job, recruiters: job.recruiters || [] });
  const [subordinates, setSubordinates] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [recruiters, setRecruiters] = useState(job.recruiters || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [linkingCandidates, setLinkingCandidates] = useState(false);
  const [showLinkedCandidatesModal, setShowLinkedCandidatesModal] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(job.status || 'New');
  const [showCompanyNameModal, setShowCompanyNameModal] = useState(false);
  const [existingWorkflow, setExistingWorkflow] = useState(null);
  const [checkingWorkflow, setCheckingWorkflow] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState({
    open: false,
    newStatus: ''
  });

  // Update currentStatus when job prop changes
  useEffect(() => {
    setCurrentStatus(job.status || 'New');
  }, [job.status]);

  // Check for existing workflow
  useEffect(() => {
    const checkWorkflow = async () => {
      try {
        setCheckingWorkflow(true);
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${API_URL}/api/workflows/job/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const activeWorkflow = response.data.find(w => w.status === 'Active');
        setExistingWorkflow(activeWorkflow || null);
      } catch (error) {
        console.error('Error checking workflow:', error);
        setExistingWorkflow(null);
      } finally {
        setCheckingWorkflow(false);
      }
    };
    
    if (job._id) {
      checkWorkflow();
    }
  }, [job._id]);

  const handleQuickStatusChangeRequest = (newStatus) => {
    // Check if workflow exists - only allow "Ongoing client process" or "Completed"
    if (existingWorkflow && existingWorkflow.status === 'Active') {
      const allowedStatuses = ['Ongoing client process', 'Completed'];
      if (!allowedStatuses.includes(newStatus)) {
        toast.error('Client side process already started');
        return;
      }
    }
    
    setStatusChangeConfirm({
      open: true,
      newStatus
    });
  };

  const handleQuickStatusChangeConfirm = async () => {
    const { newStatus } = statusChangeConfirm;
    setStatusChangeConfirm({ open: false, newStatus: '' });
    
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.put(
        `${API_URL}/api/jobs/${job._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setCurrentStatus(newStatus);
      
      // Update the job prop (for parent component sync)
      Object.assign(job, response.data);
      
      // Emit event to update job list
      window.dispatchEvent(new CustomEvent('jobUpdated', { 
        detail: { jobId: job._id, updatedJob: response.data } 
      }));
      
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Halted': return '#ef4444';
      case 'Withdrawn': return '#6b7280';
      case 'Ongoing client process': return '#8b5cf6';
      case 'Completed': return '#10b981';
      default: return '#64748b';
    }
  };

  // Debug: Log job data when expanded to verify recruiter fields
  useEffect(() => {
    if (expanded) {
      //console.log('=== JOB DETAILS EXPANDED ===');
      //console.log('Job ID:', job._id);
      //console.log('Job Title:', job.title);
      //console.log('Recruiters:', job.recruiters);
      //console.log('Full job object:', job);
    }
  }, [expanded, job]);

  // Fetch subordinates when entering edit mode
  useEffect(() => {
    if (editMode) {
      const token = localStorage.getItem('jwt');
      axios.get(`${API_URL}/api/auth/subordinates`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSubordinates(res.data));
    }
  }, [editMode]);

  // Reset editJob state when job prop changes
  useEffect(() => {
    setEditJob({ ...job, recruiters: job.recruiters || [] });
    setRecruiters(job.recruiters || []);
  }, [job]);

  // When entering edit mode, ensure recruiters array exists
  const handleEditClick = () => {
    // Check if workflow exists - prevent editing
    if (existingWorkflow && existingWorkflow.status === 'Active') {
      toast.error('Client side process is already started for this job');
      return;
    }
    
    const recruitersList = job.recruiters && job.recruiters.length > 0 
      ? job.recruiters 
      : [{ name: '', email: '', phone: '' }];
    
    setEditJob(prev => ({
      ...prev,
      recruiters: recruitersList
    }));
    setRecruiters(recruitersList);
    setEditMode(true);
  };

  const findSuitableCandidates = () => {
    setShowAIWarning(true);
  };

  const handleAIWarningProceed = () => {
    // Close AI warning first
    setShowAIWarning(false);
    // Open preference modal after a brief delay to ensure proper state update
    setTimeout(() => {
      setShowPreferenceModal(true);
    }, 100);
  };

  const handlePreferenceConfirm = (preferences) => {
    setUserPreferences(preferences);
    setShowPreferenceModal(false);
    setShowResultsPopup(true);
  };

  const handleLinkAICandidatesToJob = async () => {
    if (!candidates || candidates.length === 0) {
      toast.warning('No candidates to link');
      return;
    }

    try {
      setLinkingCandidates(true);
      const token = localStorage.getItem('jwt');
      const candidateIds = candidates.map(c => c._id);
      
      const response = await axios.post(`${API_URL}/api/candidate-job-links/link`, {
        candidateIds,
        jobId: job._id,
        source: 'ai-suggested'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Successfully linked ${response.data.links.length} AI-suggested candidate(s) to this job`);
    } catch (error) {
      console.error('Error linking candidates to job:', error);
      toast.error(error.response?.data?.error || 'Failed to link candidates to job');
    } finally {
      setLinkingCandidates(false);
    }
  };

  const handleFindCandidatesWithLimit = async (limit) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('jwt');
      const res = await axios.post(`${API_URL}/api/jobs/${job._id}/suitable-candidates?limit=${limit}`, {
        preferences: userPreferences
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.suitableCandidates && res.data.suitableCandidates.length > 0) {
        // Limit the results to the requested number
        const limitedCandidates = res.data.suitableCandidates.slice(0, limit);
        setCandidates(limitedCandidates);
        setMatchingResults({
          ...res.data,
          suitableCandidates: limitedCandidates
        });
        setShowCandidates(true);
        toast.success(`Found ${limitedCandidates.length} suitable candidates!`);
      } else {
        toast.info('No suitable candidates found for this job.');
      }
    } catch (error) {
      console.error('Error finding suitable candidates:', error);
      toast.error('Failed to find suitable candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = () => {
    setShowDeletePopup(true);
  };

  const confirmDeleteJob = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/jobs/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Job deleted successfully!');
      
      // Close the popup
      setShowDeletePopup(false);
      
      // Emit event to notify parent component
      window.dispatchEvent(new CustomEvent('jobDeleted', { 
        detail: { jobId: job._id } 
      }));
      
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  const handleShareableLink = () => {
    setShowCompanyNameModal(true);
  };

  const handleCompanyNameModalConfirm = (shareableUrl) => {
    toast.success('Shareable link copied to clipboard!');
  };

  const handleAddCandidateForJob = (e) => {
    e.stopPropagation();
    // Navigate to dashboard with addCandidate view and pass job data
    navigate('/dashboard', { 
      state: { 
        view: 'addCandidate',
        preSelectedJob: {
          _id: job._id,
          title: job.title,
          organization: job.organization
        }
      } 
    });
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditJob({ ...editJob, [name]: type === 'checkbox' ? checked : value });
  };

  // Recruiter management functions
  const handleRecruiterChange = (index, field, value) => {
    const updatedRecruiters = [...recruiters];
    updatedRecruiters[index][field] = value;
    setRecruiters(updatedRecruiters);
  };

  const addRecruiter = () => {
    setRecruiters([...recruiters, { name: '', email: '', phone: '' }]);
  };

  const removeRecruiter = (index) => {
    if (recruiters.length > 1) {
      setRecruiters(recruiters.filter((_, i) => i !== index));
    } else {
      toast.warning('At least one contact is required');
    }
  };

  const handleSave = async () => {
    try {
      // Basic validation
      if (!editJob.title || !editJob.organization || !editJob.location) {
        toast.error('Please fill in all required fields (Title, Organization, Location)');
        return;
      }

      // Ensure experience is a valid number
      if (editJob.experience && (isNaN(editJob.experience) || editJob.experience < 0)) {
        toast.error('Experience must be a valid positive number');
        return;
      }

      // Validate CTC range if provided
      const ctcMinVal = editJob.ctcMin !== '' && editJob.ctcMin !== undefined ? parseFloat(editJob.ctcMin) : undefined;
      const ctcMaxVal = editJob.ctcMax !== '' && editJob.ctcMax !== undefined ? parseFloat(editJob.ctcMax) : undefined;
      
      if (ctcMinVal !== undefined && ctcMaxVal !== undefined && ctcMinVal > ctcMaxVal) {
        toast.error('Minimum CTC cannot be greater than Maximum CTC');
        return;
      }

      // Prepare the data to send
      const jobDataToUpdate = {
        title: editJob.title.trim(),
        organization: editJob.organization.trim(),
        location: editJob.location.trim(),
        experience: editJob.experience && editJob.experience !== '' ? parseInt(editJob.experience) : undefined,
        ctcMin: ctcMinVal,
        ctcMax: ctcMaxVal,
        industry: editJob.industry && editJob.industry.trim() !== '' ? editJob.industry.trim() : undefined,
        remote: editJob.remote || false,
        description: editJob.description && editJob.description.trim() !== '' ? editJob.description.trim() : undefined,
        recruiters: recruiters.filter(rec => rec.name && rec.name.trim() !== '')
      };

      // Remove undefined, null, and empty string values
      Object.keys(jobDataToUpdate).forEach(key => {
        if (jobDataToUpdate[key] === undefined || 
            jobDataToUpdate[key] === null || 
            jobDataToUpdate[key] === '' ||
            (typeof jobDataToUpdate[key] === 'string' && jobDataToUpdate[key].trim() === '')) {
          delete jobDataToUpdate[key];
        }
      });

      //console.log('Original editJob data:', editJob);
      //console.log('Prepared job data to update:', jobDataToUpdate);
      //console.log('Job ID:', job._id);

      const token = localStorage.getItem('jwt');
      const response = await axios.put(`${API_URL}/api/jobs/${job._id}`, jobDataToUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        toast.success('Job updated successfully!');
        setEditMode(false);
        
        // Update the local job data with the response from backend
        const updatedJobData = response.data;
        Object.assign(job, updatedJobData);
        
        // Trigger a re-render by updating the editJob state
        setEditJob({ ...updatedJobData });
        
        // Emit event to notify parent component to refresh the job list
        window.dispatchEvent(new CustomEvent('jobUpdated', { 
          detail: { jobId: job._id, updatedJob: updatedJobData } 
        }));
        
        //console.log('Job updated successfully in frontend:', updatedJobData);
      }
    } catch (error) {
      console.error('Error updating job:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.details || 
                           'Server error occurred';
        toast.error(`Failed to update job: ${errorMessage}`);
        
        // Log the full error response for debugging
        if (error.response.data?.details) {
          console.error('Validation errors:', error.response.data.details);
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error: Unable to connect to server');
      } else {
        // Other error
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Box 
      onClick={editMode ? undefined : onExpandClick}
      sx={{
        p: 3, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        color: '#1e293b', 
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease',
        cursor: editMode ? 'default' : 'pointer',
        '&:hover': {
          boxShadow: editMode ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 6px 25px rgba(0, 0, 0, 0.25)',
          border: editMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.12)',
          transform: editMode ? 'none' : 'translateY(-2px)'
        }
      }}
    >
      <Stack spacing={3}>
        {/* Header with expand/collapse and basic info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onExpandClick();
              }}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#64748b',
                fontSize: '0.75rem',
                padding: '4px 8px',
                minWidth: 'auto',
                borderRadius: 1,
                '&:hover': {
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                },
              }}
            >
              {expanded ? 'Hide' : 'View'}
            </Button>
            <Typography variant="h5" sx={{fontWeight: 700, color: '#8b5cf6'}}>
              {job.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{color: '#64748b'}}>
            {job.organization}
          </Typography>
        </Box>

        {/* Show basic info when collapsed */}
        {!expanded && !editMode && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" sx={{color: '#1e293b'}}>
              <strong>Location:</strong> {job.location}
            </Typography>
            <Typography variant="body1" sx={{color: '#1e293b'}}>
              <strong>Experience:</strong> {job.experience} years
            </Typography>
            {(job.ctcMin !== undefined || job.ctcMax !== undefined) && (
              <Typography variant="body1" sx={{color: '#1e293b'}}>
                <strong>CTC:</strong> ₹ {job.ctcMin ?? '-'} - {job.ctcMax ?? '-'} LPA
              </Typography>
            )}
            {job.industry && (
              <Typography variant="body1" sx={{color: '#1e293b'}}>
                <strong>Industry:</strong> {job.industry}
              </Typography>
            )}
            <Typography variant="body1" sx={{color: '#1e293b'}}>
              <strong>Remote:</strong> {job.remote ? 'Available' : 'Not Available'}
            </Typography>
          </Box>
        )}

        {/* Show full details when expanded */}
        {expanded && !editMode && (
          <>
            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {accessLevel === 2 && (
                <Button 
                  variant="outlined" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick();
                  }}
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                    color: '#64748b',
                    '&:hover': { borderColor: '#8b5cf6', color: '#8b5cf6' }
                  }}
                >
                  Edit
                </Button>
              )}
              <Button 
                variant="contained" 
                onClick={(e) => {
                  e.stopPropagation();
                  findSuitableCandidates();
                }}
                disabled={isLoading}
                sx={{ 
                  backgroundColor: '#2563eb', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#3d7be8' },
                  '&:disabled': { backgroundColor: '#475569' }
                }}
              >
                {isLoading ? 'Finding...' : 'Find Suitable Candidates'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLinkedCandidatesModal(true);
                }}
                startIcon={<PeopleIcon />}
                sx={{ 
                  borderColor: 'rgba(238, 187, 195, 0.5)', 
                  color: '#8b5cf6',
                  '&:hover': { 
                    borderColor: '#8b5cf6', 
                    backgroundColor: 'rgba(139, 92, 246, 0.08)' 
                  }
                }}
              >
                View Linked Candidates
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleAddCandidateForJob}
                startIcon={<PersonAddIcon />}
                sx={{ 
                  borderColor: 'rgba(37, 99, 235, 0.5)', 
                  color: '#2563eb',
                  '&:hover': { 
                    borderColor: '#2563eb', 
                    backgroundColor: 'rgba(37, 99, 235, 0.08)' 
                  }
                }}
              >
                Add Candidate for this Job
              </Button>
              <Button 
                variant="outlined" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareableLink();
                }}
                startIcon={<ShareIcon />}
                sx={{ 
                  borderColor: 'rgba(76, 175, 80, 0.5)', 
                  color: '#4caf50',
                  '&:hover': { 
                    borderColor: '#4caf50', 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)' 
                  }
                }}
              >
                Shareable Link
              </Button>
            </Box>

            {/* Job Details - Tabular Format */}
            <TableContainer component={Paper} sx={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: 1,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <Table>
                <TableBody>
                  {/* Location */}
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ 
                      color: '#90caf9', 
                      fontWeight: 600, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      width: '30%',
                      py: 2
                    }}>
                      Location
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#1e293b', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      {job.location}
                    </TableCell>
                  </TableRow>
                  
                  {/* Years of Experience */}
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ 
                      color: '#90caf9', 
                      fontWeight: 600, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      Years of Experience
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#1e293b', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      {job.experience} years
                    </TableCell>
                  </TableRow>
                  
                  {/* CTC */}
                  {(job.ctcMin !== undefined || job.ctcMax !== undefined) && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        CTC
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#1e293b', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        ₹ {job.ctcMin ?? '-'} - {job.ctcMax ?? '-'} LPA
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Industry */}
                  {job.industry && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600, 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        Industry
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#1e293b', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        {job.industry}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Remote Work */}
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ 
                      color: '#90caf9', 
                      fontWeight: 600, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      Remote Work
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#1e293b', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      {job.remote ? 'Available' : 'Not Available'}
                    </TableCell>
                  </TableRow>

                  {/* Status */}
                  <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ 
                      color: '#90caf9', 
                      fontWeight: 600, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#1e293b', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={currentStatus}
                          onChange={(e) => handleQuickStatusChangeRequest(e.target.value)}
                          sx={{
                            backgroundColor: `${getStatusColor(currentStatus)}20`,
                            color: getStatusColor(currentStatus),
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '&:hover': {
                              backgroundColor: `${getStatusColor(currentStatus)}30`,
                            },
                            '& .MuiSelect-select': {
                              padding: '4px 8px',
                              fontSize: '0.875rem',
                            }
                          }}
                        >
                          <MenuItem value="New" disabled={existingWorkflow && existingWorkflow.status === 'Active'}>New</MenuItem>
                          <MenuItem value="In Progress" disabled={existingWorkflow && existingWorkflow.status === 'Active'}>In Progress</MenuItem>
                          <MenuItem value="Halted" disabled={existingWorkflow && existingWorkflow.status === 'Active'}>Halted</MenuItem>
                          <MenuItem value="Withdrawn" disabled={existingWorkflow && existingWorkflow.status === 'Active'}>Withdrawn</MenuItem>
                          <MenuItem value="Ongoing client process">Ongoing client process</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                  
                  {/* Job Description */}
                  {job.description && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600, 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        verticalAlign: 'top',
                        py: 2
                      }}>
                        Job Description
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#1e293b', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        lineHeight: 1.6,
                        py: 2
                      }}>
                        {job.description}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Client Contact */}
                  {job.recruiters && job.recruiters.length > 0 && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600, 
                        borderBottom: job.authorizedUsers && job.authorizedUsers.length > 0 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        verticalAlign: 'top',
                        py: 2
                      }}>
                        Client Contact
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#1e293b', 
                        borderBottom: job.authorizedUsers && job.authorizedUsers.length > 0 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        py: 2
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {job.recruiters.map((recruiter, index) => (
                            <Paper
                              key={recruiter._id || index}
                              sx={{
                                p: 2,
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 1,
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                              }}
                            >
                              <Typography variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                                <strong>Name:</strong> {recruiter.name}
                              </Typography>
                              {recruiter.email && (
                                <Typography variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                                  <strong>Email:</strong> {recruiter.email}
                                </Typography>
                              )}
                              {recruiter.phone && (
                                <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                  <strong>Phone:</strong> {recruiter.phone}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Internal Recruiter Contact Details */}
                  {job.authorizedUsers && job.authorizedUsers.length > 0 && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600, 
                        borderBottom: 'none',
                        verticalAlign: 'top',
                        py: 2
                      }}>
                        Internal Recruiter Contact Details
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#1e293b', 
                        borderBottom: 'none',
                        py: 2
                      }}>
                        <TableContainer component={Paper} sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          boxShadow: 'none'
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                                <TableCell sx={{ color: '#8b5cf6', fontWeight: 600, py: 1.5 }}>Name</TableCell>
                                <TableCell sx={{ color: '#8b5cf6', fontWeight: 600, py: 1.5 }}>Email</TableCell>
                                <TableCell sx={{ color: '#8b5cf6', fontWeight: 600, py: 1.5 }}>Phone</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {job.authorizedUsers.map((user, index) => (
                                <TableRow 
                                  key={user._id || index}
                                  sx={{ 
                                    '&:hover': { background: 'rgba(255, 255, 255, 0.08)' },
                                    '&:last-child td': { borderBottom: 0 }
                                  }}
                                >
                                  <TableCell sx={{ color: '#1e293b', py: 1.5 }}>
                                    {user.fullName || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ color: '#1e293b', py: 1.5 }}>
                                    {user.email || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ color: '#1e293b', py: 1.5 }}>
                                    {user.phone || 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {editMode && (
          <Box onClick={(e) => e.stopPropagation()}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: 2,
              borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
            }}>
              <Typography variant="h5" sx={{fontWeight: 700, color: '#8b5cf6'}}>Edit Job</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(false);
                  }}
                  sx={{ 
                    borderColor: '#475569', 
                    color: '#64748b',
                    '&:hover': { borderColor: '#8b5cf6', color: '#8b5cf6' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  sx={{ 
                    backgroundColor: '#8b5cf6', 
                    color: '#f8fafc',
                    '&:hover': { backgroundColor: '#d4a5ac' }
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
            
            {/* Edit Form - All inputs on separate lines */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Job Title */}
              <TextField
                label="Job Title"
                name="title"
                value={editJob.title}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              
              {/* Organization */}
              <TextField
                label="Organization"
                name="organization"
                value={editJob.organization}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              
              {/* Location */}
              <TextField
                label="Location"
                name="location"
                value={editJob.location}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              
              {/* Experience */}
              <TextField
                label="Experience (years)"
                name="experience"
                type="number"
                value={editJob.experience}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              
              {/* CTC Range */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 1 }}>
                  CTC Range (LPA)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Minimum CTC"
                      name="ctcMin"
                      type="number"
                      value={editJob.ctcMin ?? ''}
                      onChange={handleEditChange}
                      fullWidth
                      inputProps={{ step: "0.1", min: "0" }}
                      placeholder="e.g., 8.5"
                      sx={{ 
                        '& .MuiInputBase-input': { color: '#1e293b' }, 
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Maximum CTC"
                      name="ctcMax"
                      type="number"
                      value={editJob.ctcMax ?? ''}
                      onChange={handleEditChange}
                      fullWidth
                      inputProps={{ step: "0.1", min: "0" }}
                      placeholder="e.g., 12.5"
                      sx={{ 
                        '& .MuiInputBase-input': { color: '#1e293b' }, 
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                          '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              {/* Industry */}
              <TextField
                label="Industry"
                name="industry"
                value={editJob.industry}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />
              
              {/* Remote Work */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editJob.remote}
                    onChange={handleEditChange}
                    name="remote"
                    sx={{
                      color: '#8b5cf6',
                      '&.Mui-checked': { color: '#8b5cf6' }
                    }}
                  />
                }
                label="Remote Work Available"
                sx={{ color: '#1e293b', mt: 1 }}
              />

              {/* Status */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: '#64748b' }}>Status</InputLabel>
                <Select
                  name="status"
                  value={editJob.status || 'New'}
                  onChange={handleEditChange}
                  label="Status"
                  sx={{
                    color: '#1e293b',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                    '& .MuiSvgIcon-root': { color: '#64748b' },
                  }}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Halted">Halted</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
              
              {/* Description */}
              <TextField
                label="Description"
                name="description"
                value={editJob.description}
                onChange={handleEditChange}
                multiline
                rows={4}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#1e293b' }, 
                  '& .MuiInputLabel-root': { color: '#64748b' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              />

              {/* Client Contact Section */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                    Client Contact ({recruiters.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      addRecruiter();
                    }}
                    size="small"
                    sx={{
                      borderColor: '#51cf66',
                      color: '#51cf66',
                      '&:hover': {
                        borderColor: '#51cf66',
                        backgroundColor: 'rgba(81, 207, 102, 0.1)'
                      }
                    }}
                  >
                    Add Contact
                  </Button>
                </Box>

                {recruiters.map((recruiter, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Contact {index + 1}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecruiter(index);
                        }}
                        disabled={recruiters.length === 1}
                        size="small"
                        sx={{
                          color: '#ff6b6b',
                          '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
                          '&.Mui-disabled': { color: '#475569' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Name *"
                          value={recruiter.name || ''}
                          onChange={(e) => handleRecruiterChange(index, 'name', e.target.value)}
                          fullWidth
                          required
                          sx={{
                            '& .MuiInputBase-input': { color: '#1e293b' },
                            '& .MuiInputLabel-root': { color: '#64748b' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email"
                          type="email"
                          value={recruiter.email || ''}
                          onChange={(e) => handleRecruiterChange(index, 'email', e.target.value)}
                          fullWidth
                          sx={{
                            '& .MuiInputBase-input': { color: '#1e293b' },
                            '& .MuiInputLabel-root': { color: '#64748b' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Phone"
                          value={recruiter.phone || ''}
                          onChange={(e) => handleRecruiterChange(index, 'phone', e.target.value)}
                          fullWidth
                          sx={{
                            '& .MuiInputBase-input': { color: '#1e293b' },
                            '& .MuiInputLabel-root': { color: '#64748b' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Show matching results summary */}
        {matchingResults && (
          <Box sx={{ p: 2, background: 'rgba(79, 140, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(37, 99, 235, 0.18)' }}>
            <Typography variant="h6" sx={{ color: '#2563eb', mb: 1 }}>
              Matching Results
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Found {matchingResults.suitableCandidates.length} suitable candidates out of {matchingResults.totalCandidates} total candidates.
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Top matches are displayed below, sorted by relevance score.
            </Typography>
          </Box>
        )}
        
        {showCandidates && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8b5cf6' }}>
                Suitable Candidates (Top {candidates.length})
              </Typography>
              <Button
                variant="contained"
                onClick={handleLinkAICandidatesToJob}
                disabled={linkingCandidates}
                sx={{
                  backgroundColor: '#8b5cf6',
                  color: '#f8fafc',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#d4a5ad',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(238, 187, 195, 0.3)',
                    color: 'rgba(26, 26, 46, 0.5)',
                  }
                }}
              >
                {linkingCandidates ? 'Linking...' : 'Link Candidates to Job'}
              </Button>
            </Box>
            <Paper sx={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <List>
                {candidates.map((candidate, index) => (
                  <ListItem
                    key={candidate._id}
                    disablePadding
                    sx={{
                      borderBottom: index < candidates.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <ListItemButton
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowCandidateModal(true);
                      }}
                      sx={{
                        py: 2,
                        '&:hover': {
                          background: 'rgba(79, 140, 255, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                              {index + 1}. {candidate.name}
                            </Typography>
                            <Chip
                              label={`Score: ${candidate.score}%`}
                              sx={{
                                backgroundColor: candidate.score >= 80 ? '#4caf50' : candidate.score >= 60 ? '#ff9800' : '#f44336',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {candidate.email}
                            </Typography>
                            {candidate.phone && (
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {candidate.phone}
                              </Typography>
                            )}
                            {candidate.matchDetails && candidate.matchDetails.length > 0 && (
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {candidate.matchDetails.slice(0, 2).map((detail, idx) => (
                                  <Chip
                                    key={idx}
                                    label={detail}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(37, 99, 235, 0.12)',
                                      color: '#2563eb',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Stack>
      
      {/* Preference Selection Modal */}
      <AIWarningDialog
        open={showAIWarning}
        onClose={() => setShowAIWarning(false)}
        onProceed={handleAIWarningProceed}
        featureName="Candidate Matching"
      />

      <PreferenceSelectionModal
        open={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onConfirm={handlePreferenceConfirm}
        title="Set Your Preferences"
      />
      
      {/* Results Limit Popup */}
      <ResultsLimitPopup
        open={showResultsPopup}
        onClose={() => setShowResultsPopup(false)}
        onConfirm={handleFindCandidatesWithLimit}
        title="Find Suitable Candidates"
        maxResults={100}
      />
      
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        open={showDeletePopup}
        onClose={cancelDelete}
        onConfirm={confirmDeleteJob}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        itemName={job.title}
        isDeleting={isDeleting}
      />

      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        open={showCandidateModal}
        onClose={() => {
          setShowCandidateModal(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        preferences={userPreferences}
        accessLevel={accessLevel}
      />

      {/* Linked Candidates Modal */}
      <LinkedCandidates
        open={showLinkedCandidatesModal}
        onClose={() => setShowLinkedCandidatesModal(false)}
        jobId={job._id}
        jobTitle={job.title}
        accessLevel={accessLevel}
      />

      {/* Company Name Visibility Modal */}
      <CompanyNameVisibilityModal
        open={showCompanyNameModal}
        onClose={() => setShowCompanyNameModal(false)}
        onConfirm={handleCompanyNameModalConfirm}
        jobId={job._id}
        organizationName={job.organization}
        recruiterId={userId}
      />

      {/* Status Change Confirmation Dialog */}
      <StatusChangeConfirmDialog
        open={statusChangeConfirm.open}
        onClose={() => setStatusChangeConfirm({ open: false, newStatus: '' })}
        onConfirm={handleQuickStatusChangeConfirm}
        title="Confirm Job Status Change"
        currentStatus={currentStatus}
        newStatus={statusChangeConfirm.newStatus}
        itemName={job.title}
        itemType="job"
      />
    </Box>
  );
};

export default JobDetails;
