import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Stack,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  AccountTree as WorkflowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Tag as TagIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import WorkflowCreationModal from '../components/WorkflowCreationModal';
import useEmailNotification from '../hooks/useEmailNotification';
import EmailConfirmationModal from '../components/EmailConfirmationModal';
import CandidateDetailsModal from '../components/CandidateDetailsModal';

const Workflows = ({ user }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showOnlyMyWorkflows, setShowOnlyMyWorkflows] = useState(false); // New state for toggle
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  
  // Email notification hook
  const {
    emailPreview,
    showEmailModal,
    handleWorkflowCreatedEmail,
    handleWorkflowUpdatedEmail,
    closeEmailModal,
    confirmAndSendEmail
  } = useEmailNotification();

  useEffect(() => {
    fetchWorkflows();
    
    // Check for workflow data from LinkedCandidates in sessionStorage
    const workflowData = sessionStorage.getItem('workflowData');
    if (workflowData) {
      try {
        const data = JSON.parse(workflowData);
        console.log('Found workflow data from linked candidates:', data);
        
        // Open workflow creation modal with pre-filled data
        // We'll need to structure this data appropriately
        setSelectedWorkflow({
          isFromLinkedCandidates: true,
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          candidates: data.candidates
        });
        setShowWorkflowModal(true);
        
        // Clear the sessionStorage
        sessionStorage.removeItem('workflowData');
      } catch (error) {
        console.error('Error parsing workflow data from sessionStorage:', error);
      }
    }
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get('https://ats-backend-2vus.onrender.com/api/workflows', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkflows(response.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);

  const handleDeleteWorkflow = (workflow) => {
    console.log('Setting workflow to delete:', workflow);
    setWorkflowToDelete(workflow);
    setShowDeletePopup(true);
  };

  const confirmDeleteWorkflow = async () => {
    try {
      console.log('Confirming delete for workflow:', workflowToDelete);
      console.log('Workflow ID to delete:', workflowToDelete?._id);
      
      if (!workflowToDelete || !workflowToDelete._id) {
        toast.error('Invalid workflow data for deletion');
        return;
      }
      
      const token = localStorage.getItem('jwt');
      await axios.delete(`https://ats-backend-2vus.onrender.com/api/workflows/${workflowToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: user._id }
      });
      toast.success('Workflow deleted successfully!');
      fetchWorkflows();
      setShowDeletePopup(false);
      setWorkflowToDelete(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setWorkflowToDelete(null);
  };

  const handleEditWorkflow = (workflow) => {
    // Check if user can edit this workflow
    if (user.accessLevel === 1 && workflow.createdBy._id !== user._id) {
      toast.error('You can only edit workflows that you created');
      return;
    }
    setSelectedWorkflow(workflow);
    setShowWorkflowModal(true);
  };

  const handleViewWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowViewModal(true);
    // Reset expanded phases when opening modal
    setExpandedPhases(new Set());
  };

  const togglePhaseExpansion = (phaseIndex) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseIndex)) {
        newSet.delete(phaseIndex);
      } else {
        newSet.add(phaseIndex);
      }
      return newSet;
    });
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleWorkflowUpdated = async (resultData, action) => {
    // Refresh workflows list
    await fetchWorkflows();
    
    // Handle email notifications
    if (resultData && resultData._emailNotificationPending) {
      if (action === 'created') {
        // Workflow created - send emails to candidates in first phase
        if (resultData.workflow) {
          await handleWorkflowCreatedEmail(resultData.workflow);
        }
      } else if (action === 'updated') {
        // Workflow updated - send emails for the updated/added phase
        if (resultData.workflow) {
          // Find the last phase (newly added or updated)
          const lastPhaseIndex = resultData.workflow.phases?.length - 1;
          await handleWorkflowUpdatedEmail(resultData.workflow, lastPhaseIndex);
        }
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return { bg: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' };
      case 'Medium': return { bg: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' };
      case 'High': return { bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
      case 'Urgent': return { bg: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' };
      default: return { bg: 'rgba(158, 158, 158, 0.2)', color: '#9e9e9e' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' };
      case 'Completed': return { bg: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' };
      case 'On Hold': return { bg: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' };
      case 'Cancelled': return { bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
      default: return { bg: 'rgba(158, 158, 158, 0.2)', color: '#9e9e9e' };
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesFilter = workflow.jobTitle?.toLowerCase().includes(filter.toLowerCase()) ||
                         workflow.organization?.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || workflow.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || workflow.priority === priorityFilter;
    
    // For subordinates with "My workflows" toggle enabled
    const matchesCreator = !showOnlyMyWorkflows || 
                          (workflow.createdBy && workflow.createdBy._id === user._id);
    
    return matchesFilter && matchesStatus && matchesPriority && matchesCreator;
  });


  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#b8c5d6'
      }}>
        <Typography variant="h6">Loading workflows...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        pb: 2,
        borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WorkflowIcon sx={{ fontSize: 40, color: '#eebbc3' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#eebbc3' }}>
              Workflows
            </Typography>
            <Typography variant="body1" sx={{ color: '#b8c5d6' }}>
              Manage your recruitment workflows
            </Typography>
          </Box>
        </Box>
        
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setShowWorkflowModal(true)}
          sx={{
            backgroundColor: '#4f8cff',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#3d7be8' }
          }}
        >
          Create New Workflow
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search workflows..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#b8c5d6' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  }
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#b8c5d6' }}>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                sx={{
                  color: '#f5f7fa',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(238, 187, 195, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#eebbc3' },
                  }
                }}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant={showOnlyMyWorkflows ? "contained" : "outlined"}
              onClick={() => setShowOnlyMyWorkflows(!showOnlyMyWorkflows)}
              sx={{
                backgroundColor: showOnlyMyWorkflows ? "rgba(238, 187, 195, 0.9)" : "transparent",
                color: showOnlyMyWorkflows ? "#1a1a2e" : "#eebbc3",
                borderColor: "#eebbc3",
                "&:hover": {
                  backgroundColor: showOnlyMyWorkflows ? "rgba(238, 187, 195, 1)" : "rgba(238, 187, 195, 0.1)",
                  borderColor: "#eebbc3",
                },
                fontWeight: 600,
                textTransform: "none",
                height: '56px',
              }}
            >
              My workflows
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
                 <Box sx={{ 
           textAlign: 'center', 
           py: 8,
           color: '#b8c5d6',
           background: 'rgba(255, 255, 255, 0.05)',
           borderRadius: 2,
           border: '1px dashed rgba(255, 255, 255, 0.2)'
         }}>
           <WorkflowIcon sx={{ fontSize: 60, color: '#b8c5d6', mb: 2 }} />
           <Typography variant="h6" sx={{ mb: 1 }}>
             {filter ? 'No workflows found' : 'No workflows yet'}
           </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {filter ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
          </Typography>
          {!filter && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setShowWorkflowModal(true)}
              sx={{
                backgroundColor: '#4f8cff',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#3d7be8' }
              }}
            >
              Create Workflow
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredWorkflows.map((workflow, index) => (
            <Paper
              key={workflow._id}
              onClick={() => handleViewWorkflow(workflow)}
              sx={{ 
                background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
                {/* Workflow Number */}
                <Box sx={{
                  minWidth: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #eebbc3 0%, #d4a5ac 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: '#1a1a2e',
                  boxShadow: '0 4px 12px rgba(238, 187, 195, 0.3)'
                }}>
                  {index + 1}
                </Box>

                {/* Job Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <WorkIcon sx={{ color: '#90caf9', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ color: '#f5f7fa', fontWeight: 600, noWrap: true }}>
                      {workflow.jobTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: '#90caf9', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#b8c5d6' }}>
                      {workflow.organization}
                    </Typography>
                  </Box>
                </Box>

                {/* State (Status) */}
                <Box sx={{ minWidth: 110 }}>
                  <Chip 
                    label={workflow.status} 
                    size="medium"
                    icon={<TagIcon />}
                    sx={{
                      backgroundColor: getStatusColor(workflow.status).bg,
                      color: getStatusColor(workflow.status).color,
                      fontWeight: 600,
                      width: '100%'
                    }}
                  />
                </Box>

                {/* Priority */}
                <Box sx={{ minWidth: 100 }}>
                  <Chip 
                    label={workflow.priority} 
                    size="medium"
                    icon={<FlagIcon />}
                    sx={{
                      backgroundColor: getPriorityColor(workflow.priority).bg,
                      color: getPriorityColor(workflow.priority).color,
                      fontWeight: 600,
                      width: '100%'
                    }}
                  />
                </Box>

                {/* Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3,
                  minWidth: 150
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#eebbc3', fontWeight: 700, fontSize: '1.2rem' }}>
                      {workflow.phases?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b8c5d6', fontSize: '0.7rem' }}>
                      Phases
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#4f8cff', fontWeight: 700, fontSize: '1.2rem' }}>
                      {workflow.totalCandidates || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b8c5d6', fontSize: '0.7rem' }}>
                      Candidates
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, minWidth: 'auto' }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Details">
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewWorkflow(workflow)}
                      sx={{
                        borderColor: '#4f8cff',
                        color: '#4f8cff',
                        '&:hover': {
                          borderColor: '#4f8cff',
                          backgroundColor: 'rgba(79, 140, 255, 0.1)'
                        }
                      }}
                    >
                      View
                    </Button>
                  </Tooltip>
                  <Tooltip title={user.accessLevel === 1 && workflow.createdBy._id !== user._id ? "You can only edit your own workflows" : "Edit Workflow"}>
                    <span>
                      <IconButton
                        onClick={() => handleEditWorkflow(workflow)}
                        disabled={user.accessLevel === 1 && workflow.createdBy._id !== user._id}
                        sx={{
                          color: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? '#666' : '#eebbc3',
                          border: `1px solid ${user.accessLevel === 1 && workflow.createdBy._id !== user._id ? '#666' : '#eebbc3'}`,
                          '&:hover': {
                            backgroundColor: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? 'transparent' : 'rgba(238, 187, 195, 0.1)'
                          },
                          '&.Mui-disabled': {
                            color: '#666',
                            borderColor: '#666'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {user.accessLevel === 2 && (
                    <Tooltip title="Delete Workflow">
                      <IconButton
                        onClick={() => handleDeleteWorkflow(workflow)}
                        sx={{
                          color: '#f44336',
                          border: '1px solid #f44336',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Workflow Creation Modal */}
      <WorkflowCreationModal
        open={showWorkflowModal}
        onClose={() => {
          setShowWorkflowModal(false);
          setSelectedWorkflow(null);
        }}
        job={selectedWorkflow ? { _id: selectedWorkflow.jobId, title: selectedWorkflow.jobTitle, organization: selectedWorkflow.organization } : null}
        suitableCandidates={[]}
        onWorkflowCreated={handleWorkflowUpdated}
        existingWorkflow={selectedWorkflow}
        userId={user._id}
        accessLevel={user.accessLevel}
      />

      {/* Workflow View Modal */}
      <Dialog 
        open={showViewModal} 
        onClose={() => setShowViewModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#f5f7fa', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          zIndex: 1
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#eebbc3' }}>
              Workflow Overview
            </Typography>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mt: 1 }}>
              {selectedWorkflow?.jobTitle} - {selectedWorkflow?.organization}
            </Typography>
          </Box>
          <IconButton onClick={() => setShowViewModal(false)} sx={{ color: '#b8c5d6' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {selectedWorkflow && (
            <Stack spacing={4}>
              {/* Workflow Info Chips */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={selectedWorkflow.status} 
                  icon={<TagIcon />}
                  sx={{
                    backgroundColor: getStatusColor(selectedWorkflow.status).bg,
                    color: getStatusColor(selectedWorkflow.status).color,
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={selectedWorkflow.priority} 
                  icon={<FlagIcon />}
                  sx={{
                    backgroundColor: getPriorityColor(selectedWorkflow.priority).bg,
                    color: getPriorityColor(selectedWorkflow.priority).color,
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={`${selectedWorkflow.phases?.length || 0} Phases`}
                  sx={{
                    backgroundColor: 'rgba(238, 187, 195, 0.2)',
                    color: '#eebbc3',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={`${selectedWorkflow.totalCandidates || 0} Total Candidates`}
                  sx={{
                    backgroundColor: 'rgba(79, 140, 255, 0.2)',
                    color: '#4f8cff',
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Graphical Phase Overview - Line Chart */}
              <Paper sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2
              }}>
                <Typography variant="h6" sx={{ color: '#eebbc3', mb: 3, fontWeight: 600 }}>
                  📈 Candidate Flow Across Phases
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={selectedWorkflow.phases?.map((phase, index) => ({
                      name: phase.phaseName || `Phase ${index + 1}`,
                      candidates: phase.candidates?.length || 0,
                      phaseNumber: phase.phaseNumber
                    })) || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f8cff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#b8c5d6"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <YAxis 
                      stroke="#b8c5d6"
                      style={{ fontSize: '0.8rem' }}
                      label={{ value: 'Candidates', angle: -90, position: 'insideLeft', fill: '#b8c5d6' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#f5f7fa'
                      }}
                      cursor={{ stroke: '#eebbc3', strokeWidth: 2 }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#b8c5d6' }}
                    />
                    <Area 
                      type="monotone"
                      dataKey="candidates" 
                      stroke="#4f8cff"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCandidates)"
                      name="Number of Candidates"
                      dot={{ fill: '#eebbc3', r: 6 }}
                      activeDot={{ r: 8, fill: '#eebbc3' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Detailed Phase Information - Table Format */}
              <Box>
                <Typography variant="h6" sx={{ color: '#eebbc3', mb: 3, fontWeight: 600 }}>
                  📋 Phase Details
                </Typography>
                
                <TableContainer component={Paper} sx={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 2
                }}>
                  <Table>
                    {/* Table Header */}
                    <TableBody>
                      <TableRow sx={{
                        background: 'rgba(238, 187, 195, 0.1)',
                        borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
                      }}>
                        <TableCell sx={{ color: '#eebbc3', fontWeight: 700, width: '5%', textAlign: 'center', py: 2 }}>
                          #
                        </TableCell>
                        <TableCell sx={{ color: '#eebbc3', fontWeight: 700, width: '30%', py: 2 }}>
                          Phase Name
                        </TableCell>
                        <TableCell sx={{ color: '#eebbc3', fontWeight: 700, width: '20%', py: 2 }}>
                          Phase Type
                        </TableCell>
                        <TableCell sx={{ color: '#eebbc3', fontWeight: 700, width: '15%', py: 2 }}>
                          State
                        </TableCell>
                        <TableCell sx={{ color: '#eebbc3', fontWeight: 700, width: '15%', textAlign: 'center', py: 2 }}>
                          Candidates
                        </TableCell>
                      </TableRow>

                      {/* Phase Rows */}
                      {selectedWorkflow.phases?.map((phase, index) => {
                        const isExpanded = expandedPhases.has(index);
                        return (
                        <React.Fragment key={index}>
                          {/* Main Phase Row */}
                          <TableRow
                            onClick={() => togglePhaseExpansion(index)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                                '& td:first-of-type': {
                                  borderLeft: '3px solid #eebbc3'
                                }
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Phase Number */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              textAlign: 'center',
                              py: 2
                            }}>
                              <Box sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: `hsl(${200 + index * 30}, 70%, 60%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: '#1a1a2e',
                                fontSize: '0.9rem',
                                mx: 'auto'
                              }}>
                                {phase.phaseNumber}
                              </Box>
                            </TableCell>

                            {/* Phase Name */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#f5f7fa',
                              fontWeight: 600,
                              py: 2
                            }}>
                              {phase.phaseName}
                            </TableCell>

                            {/* Phase Type */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              py: 2
                            }}>
                              <Chip 
                                label={phase.type}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(144, 202, 249, 0.2)',
                                  color: '#90caf9',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>

                            {/* State */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              py: 2
                            }}>
                              <Chip 
                                label={phase.status} 
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(phase.status).bg,
                                  color: getStatusColor(phase.status).color,
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>

                            {/* Candidates Count */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0 && !isExpanded) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              textAlign: 'center',
                              py: 2
                            }}>
                              <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1
                              }}>
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 2,
                                  py: 0.5,
                                  background: 'rgba(79, 140, 255, 0.15)',
                                  borderRadius: 1,
                                  border: '1px solid rgba(79, 140, 255, 0.3)'
                                }}>
                                  <Typography variant="h6" sx={{ color: '#4f8cff', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {phase.candidates?.length || 0}
                                  </Typography>
                                </Box>
                                {phase.candidates && phase.candidates.length > 0 && (
                                  <Box sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#4f8cff'
                                  }}>
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>

                          {/* Custom Fields Rows */}
                          {phase.customFields && phase.customFields.length > 0 && (
                            <TableRow>
                              <TableCell 
                                colSpan={5} 
                                sx={{ 
                                  borderBottom: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                                  py: 2,
                                  pl: 8,
                                  background: 'rgba(255, 255, 255, 0.02)'
                                }}
                              >
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#90caf9', fontWeight: 600, mb: 1, display: 'block' }}>
                                    Custom Fields:
                                  </Typography>
                                  <Table size="small">
                                    <TableBody>
                                      {phase.customFields.map((field, fieldIndex) => (
                                        <TableRow 
                                          key={fieldIndex}
                                          sx={{
                                            '&:hover': {
                                              background: 'rgba(238, 187, 195, 0.1)'
                                            }
                                          }}
                                        >
                                          <TableCell sx={{ 
                                            color: '#eebbc3', 
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            width: '30%',
                                            borderBottom: fieldIndex === phase.customFields.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                            py: 1
                                          }}>
                                            {field.key}
                                          </TableCell>
                                          <TableCell sx={{ 
                                            color: '#b8c5d6',
                                            fontSize: '0.8rem',
                                            borderBottom: fieldIndex === phase.customFields.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                            py: 1
                                          }}>
                                            {field.value}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Expanded Candidates Section */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell 
                                colSpan={5} 
                                sx={{ 
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                  py: 3,
                                  pl: 8,
                                  background: 'rgba(79, 140, 255, 0.05)'
                                }}
                              >
                                <Box>
                                  <Typography variant="subtitle1" sx={{ color: '#4f8cff', fontWeight: 600, mb: 2 }}>
                                    Candidates in {phase.phaseName} ({phase.candidates?.length || 0})
                                  </Typography>
                                  
                                  {phase.candidates && phase.candidates.length > 0 ? (
                                    <TableContainer component={Paper} sx={{
                                      background: 'rgba(255, 255, 255, 0.03)',
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      borderRadius: 2,
                                      maxHeight: 400,
                                      overflow: 'auto'
                                    }}>
                                      <Table size="small">
                                        <TableBody>
                                          {phase.candidates.map((candidate, candidateIndex) => (
                                            <TableRow
                                              key={candidate._id || candidateIndex}
                                              onClick={() => handleCandidateClick(candidate)}
                                              sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                  background: 'rgba(79, 140, 255, 0.1)'
                                                }
                                              }}
                                            >
                                              <TableCell sx={{ color: '#f5f7fa', fontWeight: 600, width: '40%' }}>
                                                {candidate.name || 'Unknown'}
                                              </TableCell>
                                              <TableCell sx={{ color: '#b8c5d6', width: '35%' }}>
                                                {candidate.email || 'No email'}
                                              </TableCell>
                                              <TableCell sx={{ color: '#b8c5d6', width: '25%' }}>
                                                {candidate.phone || 'No phone'}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#b8c5d6', fontStyle: 'italic' }}>
                                      No candidates in this phase
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )})}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center',
          position: 'sticky',
          bottom: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          zIndex: 1
        }}>
          <Button 
            onClick={() => setShowViewModal(false)}
            variant="contained"
            sx={{
              backgroundColor: '#4f8cff',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#3d7be8'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Popup */}
      <Dialog
        open={showDeletePopup}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#f5f7fa', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <WarningIcon sx={{ color: '#ff9800' }} />
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Delete Workflow
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#b8c5d6', mb: 2 }}>
            Are you sure you want to delete this workflow?
          </Typography>
          {workflowToDelete && (
            <Typography variant="body2" sx={{ color: '#eebbc3', fontWeight: 600 }}>
              "{workflowToDelete.jobTitle} - {workflowToDelete.organization}"
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: '#ff9800', mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button 
            onClick={cancelDelete}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#b8c5d6',
              '&:hover': {
                borderColor: '#eebbc3',
                color: '#eebbc3',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteWorkflow}
            variant="contained"
            sx={{
              backgroundColor: '#f44336',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#d32f2f' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        open={showEmailModal}
        onClose={closeEmailModal}
        emailData={emailPreview}
        onConfirm={confirmAndSendEmail}
      />

      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        open={showCandidateModal}
        onClose={() => {
          setShowCandidateModal(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        preferences={null}
      />
    </Box>
  );
};

export default Workflows;
