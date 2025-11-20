import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Autocomplete,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import PreferenceSelectionModal from './PreferenceSelectionModal.jsx';
import API_URL from '../config/api';

const WorkflowCreationModal = ({ 
  open, 
  onClose, 
  job, 
  suitableCandidates, 
  onWorkflowCreated,
  existingWorkflow = null,
  userId,
  accessLevel
}) => {
  const [phases, setPhases] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAICandidatePopup, setShowAICandidatePopup] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [aiCandidatePhaseIndex, setAiCandidatePhaseIndex] = useState(null);
  const [aiCandidateLimit, setAiCandidateLimit] = useState(5);
  const [candidatePreferences, setCandidatePreferences] = useState(null);
 

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [candidateStatuses, setCandidateStatuses] = useState({});

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
    if (open) {
      //console.log('WorkflowCreationModal opened with props:', { job, selectedJob, suitableCandidates, existingWorkflow });
      
      if (existingWorkflow) {
        // Check if this is from LinkedCandidates (special case)
        if (existingWorkflow.isFromLinkedCandidates) {
          setIsEditMode(false);
          // Initialize with Phase 0 using linked candidates
          const candidatesData = existingWorkflow.candidates.map(c => ({
            _id: c._id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            // Include any other fields needed
          }));
          
          setPhases([{
            phaseNumber: 0,
            phaseName: 'Phase 0 (When Starts)',
            candidates: candidatesData,
            type: 'Video Interview',
            customFields: [],
            status: 'Active'
          }]);
          setDescription('');
          setPriority('Medium');
          setSelectedJob({ _id: existingWorkflow.jobId, title: existingWorkflow.jobTitle });
        } else {
          // Normal edit mode
          setIsEditMode(true);
          setPhases(existingWorkflow.phases || []);
          setDescription(existingWorkflow.description || '');
          setPriority(existingWorkflow.priority || 'Medium');
          setSelectedJob({ _id: existingWorkflow.jobId, title: existingWorkflow.jobTitle, organization: existingWorkflow.organization });
        }
      } else {
        setIsEditMode(false);
        // Initialize with first phase using suitable candidates
        setPhases([{
          phaseNumber: 0,
          phaseName: 'Phase 0 (When Starts)',
          candidates: suitableCandidates || [],
          type: 'Video Interview',
          customFields: [],
          status: 'Active'
        }]);
        setDescription('');
        setPriority('Medium');
        setSelectedJob(job || null);
      }
      
      // Fetch data after state is set
      setTimeout(() => {
        fetchAllCandidates();
        fetchAllJobs();
      }, 100);
    }
  }, [open, existingWorkflow, suitableCandidates, job, accessLevel, userId]);

  const fetchAllCandidates = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/workflows/candidates/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    }
  };

  const fetchAllJobs = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Everyone can see all jobs
      setAllJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    }
  };

  const addPhase = () => {
    const newPhaseNumber = phases.length;
    const newPhase = {
      phaseNumber: newPhaseNumber,
      phaseName: `Phase ${newPhaseNumber}`,
      candidates: phases.length > 0 ? phases[phases.length - 1].candidates : [],
      type: 'Video Interview',
      customFields: [],
      status: 'Active'
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (phaseIndex) => {
    if (phases.length <= 1) {
      toast.warning('At least one phase is required');
      return;
    }
    setPhases(phases.filter((_, index) => index !== phaseIndex));
  };

  const updatePhase = (phaseIndex, field, value) => {
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex] = {
      ...updatedPhases[phaseIndex],
      [field]: value
    };
    
    // Update phase numbers
    updatedPhases.forEach((phase, index) => {
      phase.phaseNumber = index;
      phase.phaseName = `Phase ${index}${index === 0 ? ' (When Starts)' : ''}`;
    });
    
    setPhases(updatedPhases);
  };

  const addCustomField = (phaseIndex) => {
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex].customFields.push({ key: '', value: '' });
    setPhases(updatedPhases);
  };

  const updateCustomField = (phaseIndex, fieldIndex, field, value) => {
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex].customFields[fieldIndex][field] = value;
    setPhases(updatedPhases);
  };

  const removeCustomField = (phaseIndex, fieldIndex) => {
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex].customFields.splice(fieldIndex, 1);
    setPhases(updatedPhases);
  };

  const handleCandidateStatusChange = (phaseIndex, candidateId, newStatus) => {
    const key = `${phaseIndex}-${candidateId}`;
    setCandidateStatuses(prev => ({
      ...prev,
      [key]: newStatus
    }));
  };

  const getCandidateStatus = (phaseIndex, candidateId) => {
    const key = `${phaseIndex}-${candidateId}`;
    return candidateStatuses[key] || 'New';
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

  const handleSelectCandidate = (phaseIndex, candidateId) => {
    const updatedPhases = [...phases];
    const currentCandidates = updatedPhases[phaseIndex].candidates;
    
    const candidateExists = currentCandidates.find(c => c._id === candidateId);
    
    if (candidateExists) {
      // Remove candidate
      updatedPhases[phaseIndex].candidates = currentCandidates.filter(c => c._id !== candidateId);
    } else {
      // Add candidate
      const availableCandidates = phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || []);
      const candidateToAdd = availableCandidates.find(c => c._id === candidateId);
      if (candidateToAdd) {
        updatedPhases[phaseIndex].candidates = [...currentCandidates, candidateToAdd];
      }
    }
    
    setPhases(updatedPhases);
  };

  const handleSelectAllCandidates = (phaseIndex, checked) => {
    const updatedPhases = [...phases];
    const availableCandidates = phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || []);
    
    if (checked) {
      updatedPhases[phaseIndex].candidates = [...availableCandidates];
    } else {
      updatedPhases[phaseIndex].candidates = [];
    }
    
    setPhases(updatedPhases);
  };

  const handleAICandidateSuggestion = (phaseIndex) => {
    //console.log('Setting AI candidate phase index:', phaseIndex);
    setAiCandidatePhaseIndex(phaseIndex);
    setShowPreferenceModal(true);
  };

  const handlePreferenceConfirm = (preferences) => {
    setCandidatePreferences(preferences);
    setShowPreferenceModal(false);
    setShowAICandidatePopup(true);
  };

  const handleAddInterestedCandidates = async (phaseIndex) => {
    try {
      const targetJob = job || selectedJob;
      if (!targetJob) {
        toast.error('No job selected');
        return;
      }

      const jobId = typeof targetJob._id === 'string' ? targetJob._id : targetJob._id._id || targetJob._id.id;
      
      if (!jobId) {
        toast.error('Invalid job ID');
        return;
      }

      const token = localStorage.getItem('jwt');
      const response = await axios.get(
        `${API_URL}/api/candidates/job/${jobId}/applicants`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        const updatedPhases = [...phases];
        const currentPhase = updatedPhases[phaseIndex];
        
        // Add new candidates to the current phase (avoiding duplicates)
        const existingCandidateIds = currentPhase.candidates.map(c => c._id);
        const newCandidates = response.data.candidates.filter(c => !existingCandidateIds.includes(c._id));
        
        updatedPhases[phaseIndex].candidates = [...currentPhase.candidates, ...newCandidates];
        setPhases(updatedPhases);
        
        toast.success(`Added ${newCandidates.length} interested candidates to the phase!`);
      } else {
        toast.info('No candidates have applied to this job yet.');
      }
    } catch (error) {
      console.error('Error fetching interested candidates:', error);
      toast.error('Failed to fetch interested candidates');
    }
  };

  const addAISuggestedCandidates = async () => {
    try {
      const targetJob = job || selectedJob;
      if (!targetJob) {
        toast.error('No job selected for AI candidate suggestion');
        return;
      }

      if (!targetJob._id) {
        toast.error('Selected job has no ID');
        console.error('Target job missing ID:', targetJob);
        return;
      }

      if (aiCandidatePhaseIndex === null || aiCandidatePhaseIndex === undefined) {
        toast.error('Phase index not set');
        console.error('Phase index is null/undefined:', aiCandidatePhaseIndex);
        return;
      }

      //console.log('Target job:', targetJob);
      //console.log('Target job ID:', targetJob._id);
      //console.log('Target job ID type:', typeof targetJob._id);
      //console.log('Target job ID value:', JSON.stringify(targetJob._id));
      //console.log('AI candidate limit:', aiCandidateLimit);
      //console.log('Phase index:', aiCandidatePhaseIndex);

      // Extract the actual job ID - handle both string and object formats
      const jobId = typeof targetJob._id === 'string' ? targetJob._id : targetJob._id._id || targetJob._id.id;
      
      if (!jobId) {
        toast.error('Invalid job ID format');
        console.error('Could not extract job ID from:', targetJob._id);
        return;
      }
      
      const apiUrl = `${API_URL}/api/jobs/${jobId}/suitable-candidates?limit=${aiCandidateLimit}`;
      //console.log('Extracted job ID:', jobId);
      //console.log('Making API call to:', apiUrl);

      const token = localStorage.getItem('jwt');

      // Test basic connectivity first
      try {
        const testResponse = await axios.get(`${API_URL}/api/jobs/test`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        //console.log('Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.error('Test endpoint failed:', testError);
        toast.error('Backend connectivity test failed');
        return;
      }

      // Call the backend to get AI-suggested candidates with preferences
      const response = await axios.post(apiUrl, {
        preferences: candidatePreferences || {
          skillsVsDescription: 50,
          experienceVsDescription: 50,
          yearsOfExperience: 50,
          location: 50
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      //console.log('API response status:', response.status);
      //console.log('API response data:', response.data);
      
      if (response.data.suitableCandidates && response.data.suitableCandidates.length > 0) {
        const updatedPhases = [...phases];
        const currentPhase = updatedPhases[aiCandidatePhaseIndex];
        
        //console.log('Current phase before update:', currentPhase);
        
        // Add new candidates to the current phase (avoiding duplicates)
        const existingCandidateIds = currentPhase.candidates.map(c => c._id);
        const newCandidates = response.data.suitableCandidates.filter(c => !existingCandidateIds.includes(c._id));
        
        //console.log('New candidates to add:', newCandidates);
        
        updatedPhases[aiCandidatePhaseIndex].candidates = [...currentPhase.candidates, ...newCandidates];
        setPhases(updatedPhases);
        
        toast.success(`Added ${newCandidates.length} AI-suggested candidates to the phase!`);
      } else {
        toast.info('No suitable candidates found for this job.');
      }
      
      setShowAICandidatePopup(false);
      setAiCandidatePhaseIndex(null);
      setAiCandidateLimit(5);
      setCandidatePreferences(null);
    } catch (error) {
      console.error('Error adding AI-suggested candidates:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error response headers:', error.response?.headers);
      console.error('Full error object:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(`Failed to add AI-suggested candidates: ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('Failed to add AI-suggested candidates: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Failed to add AI-suggested candidates: ${error.message}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!phases.length) {
      toast.error('At least one phase is required');
      return;
    }

    if (!phases[0].candidates.length) {
      toast.error('First phase must have at least one candidate');
      return;
    }

    // Check if job is selected (either from props or user selection)
    const targetJob = job || selectedJob;
    if (!targetJob) {
      toast.error('Please select a job for this workflow');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure we have valid job ID
      const jobId = typeof targetJob._id === 'string' ? targetJob._id : targetJob._id._id || targetJob._id.id;
      
      if (!jobId) {
        toast.error('Invalid job ID');
        return;
      }

      const workflowData = {
        jobId: jobId,
        phases: phases.map(phase => ({
          phaseNumber: phase.phaseNumber,
          phaseName: phase.phaseName,
          candidates: phase.candidates.map(c => c._id || c),
          type: phase.type,
          customFields: phase.customFields.filter(f => f.key && f.value),
          status: phase.status
        })),
        description,
        priority
      };

      //console.log('Workflow data being sent:', workflowData);
      //console.log('User ID:', userId);
      //console.log('Is edit mode:', isEditMode);
      //console.log('Existing workflow ID:', existingWorkflow?._id);

      const token = localStorage.getItem('jwt');

      let result;
      if (isEditMode) {
        const updateData = {
          ...workflowData,
          userId
        };
        //console.log('Update data being sent:', updateData);
        
        result = await axios.put(`${API_URL}/api/workflows/${existingWorkflow._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Workflow updated successfully!');
      } else {
        const createData = {
          ...workflowData,
          userId
        };
        //console.log('Create data being sent:', createData);
        
        result = await axios.post(`${API_URL}/api/workflows`, createData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Workflow created successfully!');
      }

      // Pass the result data to the parent
      onWorkflowCreated(result.data, isEditMode ? 'updated' : 'created');
      onClose();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error(error.response?.data?.error || 'Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhase = (phase, phaseIndex) => (
    <Card key={phaseIndex} sx={{ 
      mb: 3, 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      borderRadius: 2
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Phase Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
        }}>
          <Typography variant="h6" sx={{ 
            color: '#8b5cf6', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {phase.phaseName}
            {phaseIndex === 0 && (
              <Chip 
                label="Initial Phase" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(37, 99, 235, 0.12)', 
                  color: '#2563eb',
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </Typography>
          {phases.length > 1 && (
            <IconButton
              onClick={() => removePhase(phaseIndex)}
              sx={{ 
                color: '#f44336',
                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* Phase Type */}
          <Grid item xs={12} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)', p: 1, borderRadius: 1, width: '100%', minWidth: '100%' }}>
            <Typography variant="caption" sx={{ color: '#90caf9', mb: 1, display: 'block' }}>
              Phase Type Field (Full Width)
            </Typography>
            <FormControl fullWidth sx={{ width: '100%', minWidth: '100%' }}>
              <InputLabel sx={{ color: '#64748b' }}>Phase Type</InputLabel>
              <Select
                value={phase.type}
                onChange={(e) => updatePhase(phaseIndex, 'type', e.target.value)}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              >
                <MenuItem value="Video Interview">Video Interview</MenuItem>
                <MenuItem value="Call Interview">Call Interview</MenuItem>
                <MenuItem value="Onsite Interview">Onsite Interview</MenuItem>
                <MenuItem value="Online Test">Online Test</MenuItem>
                <MenuItem value="Offline Test">Offline Test</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Phase Status */}
          <Grid item xs={12} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)', p: 1, borderRadius: 1, width: '100%', minWidth: '100%' }}>
            <Typography variant="caption" sx={{ color: '#90caf9', mb: 1, display: 'block' }}>
              Phase Status Field (Full Width)
            </Typography>
            <FormControl fullWidth sx={{ width: '100%', minWidth: '100%' }}>
              <InputLabel sx={{ color: '#64748b' }}>Status</InputLabel>
              <Select
                value={phase.status}
                onChange={(e) => updatePhase(phaseIndex, 'status', e.target.value)}
                sx={{
                  color: '#1e293b',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  }
                }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

                      {/* Candidates Selection */}
            <Grid item xs={12} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)', p: 1, borderRadius: 1, width: '100%', minWidth: '100%' }}>
              <Typography variant="caption" sx={{ color: '#90caf9', mb: 1, display: 'block' }}>
                Candidates Field (Full Width)
              </Typography>
              
              <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 2 }}>
                Candidates {phaseIndex === 0 ? '(Initial candidates)' : '(From previous phase)'} - {phase.candidates.length} selected
              </Typography>
              
              {/* Candidates Table */}
              {(phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || [])).length > 0 ? (
                <TableContainer component={Paper} sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  maxHeight: 400,
                  '& .MuiTableCell-root': {
                    borderColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          color: '#2563eb',
                          fontWeight: 700,
                          width: 60,
                          textAlign: 'center'
                        }}>
                          <Checkbox
                            checked={phase.candidates.length === (phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || [])).length && (phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || [])).length > 0}
                            indeterminate={phase.candidates.length > 0 && phase.candidates.length < (phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || [])).length}
                            onChange={(e) => handleSelectAllCandidates(phaseIndex, e.target.checked)}
                            sx={{
                              color: '#2563eb',
                              '&.Mui-checked': { color: '#8b5cf6' },
                              '&.MuiCheckbox-indeterminate': { color: '#8b5cf6' }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', color: '#2563eb', fontWeight: 700 }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', color: '#2563eb', fontWeight: 700 }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', color: '#2563eb', fontWeight: 700 }}>
                          Phone
                        </TableCell>
                        <TableCell sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', color: '#2563eb', fontWeight: 700, minWidth: 180 }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(phaseIndex === 0 ? allCandidates : (phases[phaseIndex - 1]?.candidates || [])).map((candidate, idx) => {
                        const isSelected = phase.candidates.some(c => c._id === candidate._id);
                        return (
                          <TableRow 
                            key={candidate._id}
                            sx={{
                              background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                              '&:hover': { background: 'rgba(79, 140, 255, 0.08)' },
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleSelectCandidate(phaseIndex, candidate._id)}
                                sx={{
                                  color: '#2563eb',
                                  '&.Mui-checked': { color: '#8b5cf6' }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                              {candidate.name}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b' }}>
                              {candidate.email}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b' }}>
                              {candidate.phone || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={getCandidateStatus(phaseIndex, candidate._id)}
                                  onChange={(e) => handleCandidateStatusChange(phaseIndex, candidate._id, e.target.value)}
                                  sx={{
                                    color: '#1e293b',
                                    fontSize: '0.85rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(0, 0, 0, 0.08)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: getStatusColor(getCandidateStatus(phaseIndex, candidate._id)),
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: getStatusColor(getCandidateStatus(phaseIndex, candidate._id)),
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
                                          fontSize: '0.85rem',
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
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                  {phaseIndex === 0 && !selectedJob && !job 
                    ? 'Select a job first to see available candidates'
                    : 'No candidates available'}
                </Typography>
              )}
            </Grid>

          {/* Custom Fields */}
          <Grid item xs={12} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)', p: 1, borderRadius: 1, width: '100%', minWidth: '100%' }}>
            <Typography variant="caption" sx={{ color: '#90caf9', mb: 1, display: 'block' }}>
              Custom Fields Section (Full Width)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#90caf9' }}>
                Custom Fields
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => addCustomField(phaseIndex)}
                sx={{
                  color: '#2563eb',
                  borderColor: '#2563eb',
                  '&:hover': { borderColor: '#3d7be8', backgroundColor: 'rgba(79, 140, 255, 0.1)' }
                }}
                variant="outlined"
                size="small"
              >
                Add Field
              </Button>
            </Box>
            
            {phase.customFields.map((field, fieldIndex) => (
              <Box key={fieldIndex} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Field name"
                  value={field.key}
                  onChange={(e) => updateCustomField(phaseIndex, fieldIndex, 'key', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': { color: '#1e293b' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    }
                  }}
                />
                <TextField
                  placeholder="Field value"
                  value={field.value}
                  onChange={(e) => updateCustomField(phaseIndex, fieldIndex, 'value', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': { color: '#1e293b' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    }
                  }}
                />
                <IconButton
                  onClick={() => removeCustomField(phaseIndex, fieldIndex)}
                  sx={{ color: '#f44336' }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            maxHeight: '95vh'
          }
        }}
      >
      <DialogTitle sx={{ 
        color: '#1e293b', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
            {isEditMode ? 'Edit Workflow' : 'Create Workflow'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            {job?.title ? `${job.title} - ${job.organization}` : 
             selectedJob?.title ? `${selectedJob.title} - ${selectedJob.organization}` : 
             'Select a job to create workflow'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Scroll Indicator */}

        
        <Stack spacing={3}>
          {/* Workflow Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Job Selection - Only show when no specific job is provided */}
            {!job && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 2, fontWeight: 600 }}>
                  Select Job for Workflow
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mb: 2, display: 'block' }}>
                  Available jobs: {allJobs.length}
                </Typography>

                <Autocomplete
                  options={allJobs}
                  value={selectedJob}
                  onChange={(_, newValue) => setSelectedJob(newValue)}
                  getOptionLabel={(option) => `${option.title} - ${option.organization}`}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a job for this workflow"
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
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" sx={{ color: '#000000', fontWeight: 600 }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {option.organization}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      backgroundColor: '#ffffff !important',
                      color: '#000000 !important',
                      border: '1px solid rgba(0, 0, 0, 0.2) !important',
                      '& li': {
                        color: '#000000 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.1) !important'
                        }
                      }
                    },
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        backgroundColor: '#ffffff !important',
                        color: '#000000 !important'
                      }
                    },
                    '& .MuiAutocomplete-endAdornment': {
                      color: '#666666'
                    }
                  }}
                />
                {selectedJob && (
                  <Typography variant="caption" sx={{ color: '#4caf50', mt: 1, display: 'block' }}>
                    ✓ Selected: {selectedJob.title} at {selectedJob.organization}
                  </Typography>
                )}
              </Box>
            )}

            {/* Priority */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: '#64748b' }}>Priority</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  sx={{
                    color: '#1e293b',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    }
                  }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />

          {/* Phases */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                Workflow Phases
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addPhase}
                sx={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#3d7be8' }
                }}
                variant="contained"
              >
                Add Another Phase
              </Button>
            </Box>

            {phases.map((phase, index) => renderPhase(phase, index))}
          </Box>

          {/* Info Alert */}
          <Alert severity="info" sx={{ 
            backgroundColor: 'rgba(79, 140, 255, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.18)',
            color: '#2563eb'
          }}>
            <Typography variant="body2">
              <strong>Note:</strong> Each phase can only include candidates from the previous phase. 
              The first phase starts with the suitable candidates found for this job.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#64748b',
            '&:hover': {
              borderColor: '#8b5cf6',
              color: '#8b5cf6',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: '#8b5cf6',
            color: '#f8fafc',
            '&:hover': { backgroundColor: '#d4a5ac' },
            '&:disabled': { backgroundColor: '#475569' }
          }}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Workflow' : 'Create Workflow')}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Preference Selection Modal */}
    <PreferenceSelectionModal
      open={showPreferenceModal}
      onClose={() => setShowPreferenceModal(false)}
      onConfirm={handlePreferenceConfirm}
      title="Set Candidate Matching Preferences"
    />

    {/* AI Candidate Suggestion Popup */}
    <Dialog
      open={showAICandidatePopup}
      onClose={() => setShowAICandidatePopup(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#1e293b', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <AddIcon sx={{ color: '#4caf50' }} />
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Select Number of Candidates
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
          Based on your preference settings, how many top matching candidates would you like to add?
        </Typography>
        
        <TextField
          type="number"
          label="Number of Candidates"
          value={aiCandidateLimit}
          onChange={(e) => setAiCandidateLimit(parseInt(e.target.value) || 1)}
          fullWidth
          inputProps={{ min: 1, max: 50 }}
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
        
        <Typography variant="caption" sx={{ color: '#90caf9', mt: 1, display: 'block' }}>
          The AI will analyze the job requirements and suggest the most suitable candidates.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button 
          onClick={() => setShowAICandidatePopup(false)}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#64748b',
            '&:hover': {
              borderColor: '#8b5cf6',
              color: '#8b5cf6',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={addAISuggestedCandidates}
          variant="contained"
          sx={{
            backgroundColor: '#4caf50',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#45a049' }
          }}
        >
          Add Candidates
        </Button>
              </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkflowCreationModal;
