import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CandidateList from './CandidateList.jsx';
import ResultsLimitPopup from './ResultsLimitPopup.jsx';
import DeleteConfirmationPopup from './DeleteConfirmationPopup.jsx';
import PreferenceSelectionModal from './PreferenceSelectionModal.jsx';
import CandidateDetailsModal from './CandidateDetailsModal.jsx';
import LinkedCandidates from './LinkedCandidates.jsx';
import { toast } from 'react-toastify';
import { Typography, Button, Box, TextField, Checkbox, FormControlLabel, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Switch, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Chip, Divider, Grid, IconButton, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Share as ShareIcon, People as PeopleIcon } from '@mui/icons-material';

const JobDetails = ({ job, userId, accessLevel, expanded, onExpandClick }) => {
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

  // Debug: Log job data when expanded to verify recruiter fields
  useEffect(() => {
    if (expanded) {
      console.log('=== JOB DETAILS EXPANDED ===');
      console.log('Job ID:', job._id);
      console.log('Job Title:', job.title);
      console.log('Recruiters:', job.recruiters);
      console.log('Full job object:', job);
    }
  }, [expanded, job]);

  // Fetch subordinates when entering edit mode
  useEffect(() => {
    if (editMode) {
      const token = localStorage.getItem('jwt');
      axios.get('https://ats-backend-2vus.onrender.com/api/auth/subordinates', {
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
    setShowPreferenceModal(true);
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
      
      const response = await axios.post('https://ats-backend-2vus.onrender.com/api/candidate-job-links/link', {
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
      const res = await axios.post(`https://ats-backend-2vus.onrender.com/api/jobs/${job._id}/suitable-candidates?limit=${limit}`, {
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
      await axios.delete(`https://ats-backend-2vus.onrender.com/api/jobs/${job._id}`, {
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
    const shareableUrl = `${window.location.origin}/apply/${job._id}`;
    navigator.clipboard.writeText(shareableUrl).then(() => {
      toast.success('Shareable link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
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
      toast.warning('At least one recruiter is required');
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

      // Prepare the data to send
      const jobDataToUpdate = {
        title: editJob.title.trim(),
        organization: editJob.organization.trim(),
        location: editJob.location.trim(),
        experience: editJob.experience && editJob.experience !== '' ? parseInt(editJob.experience) : undefined,
        ctc: editJob.ctc && editJob.ctc.trim() !== '' ? editJob.ctc.trim() : undefined,
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

      console.log('Original editJob data:', editJob);
      console.log('Prepared job data to update:', jobDataToUpdate);
      console.log('Job ID:', job._id);

      const token = localStorage.getItem('jwt');
      const response = await axios.put(`https://ats-backend-2vus.onrender.com/api/jobs/${job._id}`, jobDataToUpdate, {
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
        
        console.log('Job updated successfully in frontend:', updatedJobData);
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
      onClick={onExpandClick}
      sx={{
        p: 3, 
        background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
        borderRadius: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        color: '#f5f7fa', 
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transform: 'translateY(-2px)'
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
                color: '#b8c5d6',
                fontSize: '0.75rem',
                padding: '4px 8px',
                minWidth: 'auto',
                borderRadius: 1,
                '&:hover': {
                  borderColor: '#eebbc3',
                  color: '#eebbc3',
                },
              }}
            >
              {expanded ? 'Hide' : 'View'}
            </Button>
            <Typography variant="h5" sx={{fontWeight: 700, color: '#eebbc3'}}>
              {job.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{color: '#b8c5d6'}}>
            {job.organization}
          </Typography>
        </Box>

        {/* Show basic info when collapsed */}
        {!expanded && !editMode && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" sx={{color: '#f5f7fa'}}>
              <strong>Location:</strong> {job.location}
            </Typography>
            <Typography variant="body1" sx={{color: '#f5f7fa'}}>
              <strong>Experience:</strong> {job.experience} years
            </Typography>
            {job.ctc && (
              <Typography variant="body1" sx={{color: '#f5f7fa'}}>
                <strong>CTC (LPA):</strong> ₹ {job.ctc}
              </Typography>
            )}
            {job.industry && (
              <Typography variant="body1" sx={{color: '#f5f7fa'}}>
                <strong>Industry:</strong> {job.industry}
              </Typography>
            )}
            <Typography variant="body1" sx={{color: '#f5f7fa'}}>
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
                    color: '#b8c5d6',
                    '&:hover': { borderColor: '#eebbc3', color: '#eebbc3' }
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
                  backgroundColor: '#4f8cff', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#3d7be8' },
                  '&:disabled': { backgroundColor: '#666' }
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
                  color: '#eebbc3',
                  '&:hover': { 
                    borderColor: '#eebbc3', 
                    backgroundColor: 'rgba(238, 187, 195, 0.1)' 
                  }
                }}
              >
                View Linked Candidates
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
              {accessLevel === 2 && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob();
                  }}
                  disabled={isDeleting}
                  sx={{ 
                    borderColor: 'rgba(244, 67, 54, 0.5)', 
                    color: '#f44336',
                    '&:hover': { 
                      borderColor: '#f44336', 
                      backgroundColor: 'rgba(244, 67, 54, 0.1)' 
                    },
                    '&:disabled': { 
                      borderColor: 'rgba(244, 67, 54, 0.3)', 
                      color: 'rgba(244, 67, 54, 0.5)' 
                    }
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
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
                      color: '#f5f7fa', 
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
                      color: '#f5f7fa', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      {job.experience} years
                    </TableCell>
                  </TableRow>
                  
                  {/* CTC */}
                  {job.ctc && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        CTC (LPA)
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#f5f7fa', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        py: 2
                      }}>
                        ₹ {job.ctc}
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
                        color: '#f5f7fa', 
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
                      color: '#f5f7fa', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      py: 2
                    }}>
                      {job.remote ? 'Available' : 'Not Available'}
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
                        color: '#f5f7fa', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        lineHeight: 1.6,
                        py: 2
                      }}>
                        {job.description}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Recruiters */}
                  {job.recruiters && job.recruiters.length > 0 && (
                    <TableRow sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ 
                        color: '#90caf9', 
                        fontWeight: 600, 
                        borderBottom: 'none',
                        verticalAlign: 'top',
                        py: 2
                      }}>
                        Recruiters ({job.recruiters.length})
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#f5f7fa', 
                        borderBottom: 'none',
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
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <Typography variant="body2" sx={{ color: '#f5f7fa', mb: 0.5 }}>
                                <strong>Name:</strong> {recruiter.name}
                              </Typography>
                              {recruiter.email && (
                                <Typography variant="body2" sx={{ color: '#f5f7fa', mb: 0.5 }}>
                                  <strong>Email:</strong> {recruiter.email}
                                </Typography>
                              )}
                              {recruiter.phone && (
                                <Typography variant="body2" sx={{ color: '#f5f7fa' }}>
                                  <strong>Phone:</strong> {recruiter.phone}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {editMode && (
          <>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: 2,
              borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
            }}>
              <Typography variant="h5" sx={{fontWeight: 700, color: '#eebbc3'}}>Edit Job</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(false);
                  }}
                  sx={{ 
                    borderColor: '#666', 
                    color: '#b8c5d6',
                    '&:hover': { borderColor: '#eebbc3', color: '#eebbc3' }
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
                    backgroundColor: '#eebbc3', 
                    color: '#1a1a2e',
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
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  }
                }}
              />
              
              {/* CTC */}
              <TextField
                label="CTC (LPA)"
                name="ctc"
                value={editJob.ctc}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  }
                }}
              />
              
              {/* Industry */}
              <TextField
                label="Industry"
                name="industry"
                value={editJob.industry}
                onChange={handleEditChange}
                fullWidth
                sx={{ 
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                      color: '#eebbc3',
                      '&.Mui-checked': { color: '#eebbc3' }
                    }}
                  />
                }
                label="Remote Work Available"
                sx={{ color: '#f5f7fa', mt: 1 }}
              />
              
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
                  '& .MuiInputBase-input': { color: '#f5f7fa' }, 
                  '& .MuiInputLabel-root': { color: '#b8c5d6' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  }
                }}
              />

              {/* Recruiters Section */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 600 }}>
                    Recruiters ({recruiters.length})
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
                    Add Recruiter
                  </Button>
                </Box>

                {recruiters.map((recruiter, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Recruiter {index + 1}
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
                          '&.Mui-disabled': { color: '#666' }
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
                            '& .MuiInputBase-input': { color: '#f5f7fa' },
                            '& .MuiInputLabel-root': { color: '#b8c5d6' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                            '& .MuiInputBase-input': { color: '#f5f7fa' },
                            '& .MuiInputLabel-root': { color: '#b8c5d6' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
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
                            '& .MuiInputBase-input': { color: '#f5f7fa' },
                            '& .MuiInputLabel-root': { color: '#b8c5d6' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                              '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </Box>
          </>
        )}
        
        {/* Show matching results summary */}
        {matchingResults && (
          <Box sx={{ p: 2, background: 'rgba(79, 140, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(79, 140, 255, 0.3)' }}>
            <Typography variant="h6" sx={{ color: '#4f8cff', mb: 1 }}>
              Matching Results
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 2 }}>
              Found {matchingResults.suitableCandidates.length} suitable candidates out of {matchingResults.totalCandidates} total candidates.
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
              Top matches are displayed below, sorted by relevance score.
            </Typography>
          </Box>
        )}
        
        {showCandidates && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#eebbc3' }}>
                Suitable Candidates (Top {candidates.length})
              </Typography>
              <Button
                variant="contained"
                onClick={handleLinkAICandidatesToJob}
                disabled={linkingCandidates}
                sx={{
                  backgroundColor: '#eebbc3',
                  color: '#1a1a2e',
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
            <Paper sx={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <List>
                {candidates.map((candidate, index) => (
                  <ListItem
                    key={candidate._id}
                    disablePadding
                    sx={{
                      borderBottom: index < candidates.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
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
                            <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 600 }}>
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
                            <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                              {candidate.email}
                            </Typography>
                            {candidate.phone && (
                              <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
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
                                      backgroundColor: 'rgba(79, 140, 255, 0.2)',
                                      color: '#4f8cff',
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
      />

      {/* Linked Candidates Modal */}
      <LinkedCandidates
        open={showLinkedCandidatesModal}
        onClose={() => setShowLinkedCandidatesModal(false)}
        jobId={job._id}
        jobTitle={job.title}
        accessLevel={accessLevel}
      />
    </Box>
  );
};

export default JobDetails;
