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
  TableRow,
  TableHead,
  Collapse,
  Menu
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
  Warning as WarningIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import WorkflowCreationModal from '../components/WorkflowCreationModal';
import WorkflowFilterModal from '../components/WorkflowFilterModal';
import useEmailNotification from '../hooks/useEmailNotification';
import EmailConfirmationModal from '../components/EmailConfirmationModal';
import CandidateDetailsModal from '../components/CandidateDetailsModal';
import API_URL from '../config/api';

const Workflows = ({ user }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    organization: '',
    jobTitle: '',
    status: []
  });
  const [statusFilterAnchorEl, setStatusFilterAnchorEl] = useState(null);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('All Statuses');
  const [showOnlyMyWorkflows, setShowOnlyMyWorkflows] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState(null);
  
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
        //console.log('Found workflow data from linked candidates:', data);
        
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
      const response = await axios.get(`${API_URL}/api/workflows`, {
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
    //console.log('Setting workflow to delete:', workflow);
    setWorkflowToDelete(workflow);
    setShowDeletePopup(true);
  };

  const confirmDeleteWorkflow = async () => {
    try {
      //console.log('Confirming delete for workflow:', workflowToDelete);
      //console.log('Workflow ID to delete:', workflowToDelete?._id);
      
      if (!workflowToDelete || !workflowToDelete._id) {
        toast.error('Invalid workflow data for deletion');
        return;
      }
      
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/workflows/${workflowToDelete._id}`, {
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
    setExpandedPhases({});
  };

  const togglePhaseExpansion = (workflowId, phaseIndex) => {
    const key = `${workflowId}-${phaseIndex}`;
    setExpandedPhases(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCandidateClick = async (candidateId) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCandidate(response.data);
      setShowCandidateModal(true);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast.error('Failed to load candidate details');
    }
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

  const updateWorkflowStatus = async (workflowId, newStatus) => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.patch(
        `${API_URL}/api/workflows/${workflowId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated successfully!');
      setWorkflows(prevWorkflows =>
        prevWorkflows.map(workflow =>
          workflow._id === workflowId ? { ...workflow, status: newStatus } : workflow
        )
      );
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleStatusFilterClick = (event) => {
    setStatusFilterAnchorEl(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setCurrentStatusFilter(status);
    setActiveFilters(prev => ({
      ...prev,
      status: status === 'All Statuses' ? [] : [status]
    }));
    handleStatusFilterClose();
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

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'Active': return 'rgba(76, 175, 80, 0.12)';
      case 'Completed': return 'rgba(33, 150, 243, 0.12)';
      case 'On Hold': return 'rgba(255, 152, 0, 0.12)';
      case 'Cancelled': return 'rgba(244, 67, 54, 0.12)';
      default: return 'transparent';
    }
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      organization: '',
      jobTitle: '',
      status: []
    });
  };

  const hasActiveFilters = 
    activeFilters.organization || 
    activeFilters.jobTitle || 
    (activeFilters.status && activeFilters.status.length > 0);

  const filteredWorkflows = workflows.filter(workflow => {
    // Organization filter
    if (activeFilters.organization && 
        !workflow.organization?.toLowerCase().includes(activeFilters.organization.toLowerCase())) {
      return false;
    }
    
    // Job Title filter
    if (activeFilters.jobTitle && 
        !workflow.jobTitle?.toLowerCase().includes(activeFilters.jobTitle.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (activeFilters.status && activeFilters.status.length > 0 && 
        !activeFilters.status.includes(workflow.status)) {
      return false;
    }
    
    // For subordinates with "My workflows" toggle enabled
    const matchesCreator = !showOnlyMyWorkflows || 
                          (workflow.createdBy && workflow.createdBy._id === user._id);
    
    return matchesCreator;
  });


  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#64748b'
      }}>
        <Typography variant="h6">Loading workflows...</Typography>
      </Box>
    );
  }

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
            Workflow Listings
          </Typography>
          
          {/* Right side - Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {hasActiveFilters && (
              <Chip
                label={`${filteredWorkflows.length} results`}
                sx={{
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                  color: "#2563eb",
                  fontWeight: 600,
                }}
              />
            )}
            <Tooltip title="Filter Workflows">
              <IconButton
                onClick={() => setShowFilterModal(true)}
                sx={{
                  backgroundColor: hasActiveFilters ? "rgba(37, 99, 235, 0.15)" : "rgba(139, 92, 246, 0.12)",
                  color: hasActiveFilters ? "#2563eb" : "#8b5cf6",
                  border: hasActiveFilters ? "2px solid rgba(37, 99, 235, 0.3)" : "2px solid rgba(139, 92, 246, 0.3)",
                  padding: "10px",
                  "&:hover": {
                    backgroundColor: hasActiveFilters ? "rgba(37, 99, 235, 0.25)" : "rgba(139, 92, 246, 0.2)",
                    border: hasActiveFilters ? "2px solid rgba(37, 99, 235, 0.5)" : "2px solid rgba(139, 92, 246, 0.5)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <FilterIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create New Workflow">
              <IconButton
                onClick={() => setShowWorkflowModal(true)}
                sx={{
                  backgroundColor: "rgba(139, 92, 246, 0.12)",
                  color: "#8b5cf6",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  padding: "10px",
                  "&:hover": {
                    backgroundColor: "rgba(139, 92, 246, 0.2)",
                    border: "2px solid rgba(139, 92, 246, 0.5)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <AddIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Workflows Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          background: "var(--color-bg-dark)",
          p: 2,
        }}
      >
      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          border: '1px dashed rgba(0, 0, 0, 0.08)'
        }}>
          <WorkflowIcon sx={{ fontSize: 60, color: '#64748b', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {hasActiveFilters ? 'No workflows found' : 'No workflows yet'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {hasActiveFilters ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
          </Typography>
          {!hasActiveFilters && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setShowWorkflowModal(true)}
              sx={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#3d7be8' }
              }}
            >
              Create Workflow
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "rgba(139, 92, 246, 0.08)",
                  borderBottom: "2px solid rgba(238, 187, 195, 0.3)",
                }}
              >
                <TableCell
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    py: 2,
                  }}
                >
                  Job Title
                </TableCell>
                <TableCell
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Organization
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                  onClick={handleStatusFilterClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    Status
                    {currentStatusFilter !== 'All Statuses' && (
                      <Chip 
                        label="Filtered" 
                        size="small" 
                        sx={{ 
                          ml: 1, 
                          backgroundColor: '#2563eb', 
                          color: '#fff',
                          height: '20px',
                          fontSize: '0.7rem'
                        }} 
                      />
                    )}
                    <ExpandMoreIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Phases
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Candidates
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <React.Fragment key={workflow._id}>
                  <TableRow
                    onClick={() => setExpandedWorkflowId(expandedWorkflowId === workflow._id ? null : workflow._id)}
                    sx={{
                      backgroundColor: getStatusBackgroundColor(workflow.status || 'Active'),
                      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        background: "rgba(238, 187, 195, 0.08)",
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {workflow.jobTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                        }}
                      >
                        {workflow.organization}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <FormControl variant="outlined" size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={workflow.status || 'Active'}
                          onChange={(e) => updateWorkflowStatus(workflow._id, e.target.value)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                          sx={{
                            color: getStatusColor(workflow.status || 'Active').color,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            '& .MuiOutlinedInput-notchedOutline': { 
                              borderColor: getStatusColor(workflow.status || 'Active').color,
                              borderWidth: '2px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { 
                              borderColor: getStatusColor(workflow.status || 'Active').color,
                              borderWidth: '2px'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                              borderColor: getStatusColor(workflow.status || 'Active').color,
                              borderWidth: '2px'
                            },
                            '& .MuiSvgIcon-root': { 
                              color: getStatusColor(workflow.status || 'Active').color 
                            },
                            backgroundColor: getStatusColor(workflow.status || 'Active').bg,
                          }}
                        >
                          {['Active', 'Completed', 'On Hold', 'Cancelled'].map((statusOption) => (
                            <MenuItem 
                              key={statusOption} 
                              value={statusOption} 
                              sx={{ 
                                color: getStatusColor(statusOption).color, 
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              {statusOption}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#8b5cf6",
                          fontWeight: 700,
                        }}
                      >
                        {workflow.phases?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#2563eb",
                          fontWeight: 700,
                        }}
                      >
                        {(() => {
                          // Get candidates from the last phase
                          if (workflow.phases && workflow.phases.length > 0) {
                            const lastPhase = workflow.phases[workflow.phases.length - 1];
                            return lastPhase.candidates?.length || 0;
                          }
                          return 0;
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title={expandedWorkflowId === workflow._id ? "Hide Details" : "View Details"}>
                          <IconButton
                            onClick={() => setExpandedWorkflowId(expandedWorkflowId === workflow._id ? null : workflow._id)}
                            sx={{
                              color: "#2563eb",
                              backgroundColor: "rgba(79, 140, 255, 0.1)",
                              "&:hover": {
                                backgroundColor: "rgba(37, 99, 235, 0.12)",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            {expandedWorkflowId === workflow._id ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.accessLevel === 1 && workflow.createdBy._id !== user._id ? "You can only edit your own workflows" : "Edit Workflow"}>
                          <span>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditWorkflow(workflow);
                              }}
                              disabled={user.accessLevel === 1 && workflow.createdBy._id !== user._id}
                              sx={{
                                color: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? '#475569' : '#8b5cf6',
                                backgroundColor: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? 'transparent' : 'rgba(139, 92, 246, 0.08)',
                                "&:hover": {
                                  backgroundColor: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? 'transparent' : 'rgba(238, 187, 195, 0.2)',
                                  transform: user.accessLevel === 1 && workflow.createdBy._id !== user._id ? 'none' : 'scale(1.1)',
                                },
                                '&.Mui-disabled': {
                                  color: '#475569',
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkflow(workflow);
                              }}
                              sx={{
                                color: "#f44336",
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Workflow Details Row */}
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        py: 0,
                        borderBottom:
                          expandedWorkflowId === workflow._id
                            ? "1px solid rgba(0, 0, 0, 0.05)"
                            : "none",
                      }}
                    >
                      <Collapse
                        in={expandedWorkflowId === workflow._id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ p: 3, background: "rgba(255, 255, 255, 0.02)" }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#8b5cf6",
                              fontWeight: 600,
                              mb: 2,
                            }}
                          >
                            Workflow Details
                          </Typography>

                          {/* Workflow Phases Table */}
                          {workflow.phases && workflow.phases.length > 0 ? (
                            <TableContainer
                              component={Paper}
                              sx={{
                                background: "rgba(255, 255, 255, 0.05)",
                                maxHeight: 600,
                                overflow: "auto",
                              }}
                            >
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{ color: "#2563eb", fontWeight: 600, width: "5%" }}
                                    >
                                      
                                    </TableCell>
                                    <TableCell
                                      sx={{ color: "#2563eb", fontWeight: 600 }}
                                    >
                                      Phase
                                    </TableCell>
                                    <TableCell
                                      sx={{ color: "#2563eb", fontWeight: 600 }}
                                    >
                                      Name
                                    </TableCell>
                                    <TableCell
                                      sx={{ color: "#2563eb", fontWeight: 600 }}
                                    >
                                      Type
                                    </TableCell>
                                    <TableCell
                                      sx={{ color: "#2563eb", fontWeight: 600 }}
                                    >
                                      Status
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{ color: "#2563eb", fontWeight: 600 }}
                                    >
                                      Candidates
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {workflow.phases.map((phase, index) => {
                                    const phaseKey = `${workflow._id}-${index}`;
                                    const isPhaseExpanded = expandedPhases[phaseKey];
                                    
                                    return (
                                      <React.Fragment key={index}>
                                        <TableRow
                                          onClick={() => togglePhaseExpansion(workflow._id, index)}
                                          sx={{
                                            cursor: "pointer",
                                            "&:hover": {
                                              background: "rgba(255, 255, 255, 0.05)",
                                            },
                                          }}
                                        >
                                          <TableCell>
                                            <IconButton size="small" sx={{ color: "#2563eb" }}>
                                              {isPhaseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                          </TableCell>
                                          <TableCell sx={{ color: "#1e293b" }}>
                                            Phase {phase.phaseNumber}
                                          </TableCell>
                                          <TableCell sx={{ color: "#1e293b" }}>
                                            {phase.phaseName}
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={phase.type}
                                              size="small"
                                              sx={{
                                                backgroundColor: "rgba(144, 202, 249, 0.2)",
                                                color: "#90caf9",
                                                fontWeight: 600,
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={phase.status}
                                              size="small"
                                              sx={{
                                                backgroundColor: getStatusColor(phase.status).bg,
                                                color: getStatusColor(phase.status).color,
                                                fontWeight: 600,
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell align="center" sx={{ color: "#2563eb", fontWeight: 700 }}>
                                            {phase.candidates?.length || 0}
                                          </TableCell>
                                        </TableRow>

                                        {/* Expanded Candidates in Phase */}
                                        <TableRow>
                                          <TableCell colSpan={6} sx={{ py: 0, borderBottom: isPhaseExpanded ? "1px solid rgba(0, 0, 0, 0.05)" : "none" }}>
                                            <Collapse in={isPhaseExpanded} timeout="auto" unmountOnExit>
                                              <Box sx={{ p: 2, background: "rgba(255, 255, 255, 0.02)" }}>
                                                {phase.candidates && phase.candidates.length > 0 ? (
                                                  <Table size="small">
                                                    <TableHead>
                                                      <TableRow>
                                                        <TableCell sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                                          Name
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                                          Email
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                                          Phone
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                                          Status
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                                                          Action
                                                        </TableCell>
                                                      </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                      {phase.candidates.map((candidate) => (
                                                        <TableRow
                                                          key={candidate._id}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCandidateClick(candidate._id);
                                                          }}
                                                          sx={{
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                              background: "rgba(139, 92, 246, 0.08)",
                                                            },
                                                          }}
                                                        >
                                                          <TableCell sx={{ color: "#1e293b" }}>
                                                            {candidate.name}
                                                          </TableCell>
                                                          <TableCell sx={{ color: "#64748b" }}>
                                                            {candidate.email}
                                                          </TableCell>
                                                          <TableCell sx={{ color: "#64748b" }}>
                                                            {candidate.phone || "N/A"}
                                                          </TableCell>
                                                          <TableCell>
                                                            <Chip
                                                              label={candidate.status || "Active"}
                                                              size="small"
                                                              sx={{
                                                                backgroundColor: "rgba(76, 175, 80, 0.2)",
                                                                color: "#4caf50",
                                                                fontWeight: 600,
                                                              }}
                                                            />
                                                          </TableCell>
                                                          <TableCell align="center">
                                                            <Tooltip title="View Details">
                                                              <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleCandidateClick(candidate._id);
                                                                }}
                                                                sx={{
                                                                  color: "#2563eb",
                                                                  "&:hover": {
                                                                    backgroundColor: "rgba(79, 140, 255, 0.1)",
                                                                  },
                                                                }}
                                                              >
                                                                <ViewIcon fontSize="small" />
                                                              </IconButton>
                                                            </Tooltip>
                                                          </TableCell>
                                                        </TableRow>
                                                      ))}
                                                    </TableBody>
                                                  </Table>
                                                ) : (
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: "#64748b",
                                                      textAlign: "center",
                                                      py: 2,
                                                    }}
                                                  >
                                                    No candidates in this phase
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Collapse>
                                          </TableCell>
                                        </TableRow>
                                      </React.Fragment>
                                    );
                                  })}
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
                              <Typography variant="body2">
                                No phases in this workflow
                              </Typography>
                            </Box>
                          )}
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
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#1e293b', 
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          zIndex: 1
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
              Workflow Overview
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
              {selectedWorkflow?.jobTitle} - {selectedWorkflow?.organization}
            </Typography>
          </Box>
          <IconButton onClick={() => setShowViewModal(false)} sx={{ color: '#64748b' }}>
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
                  sx={{
                    backgroundColor: getStatusColor(selectedWorkflow.status).bg,
                    color: getStatusColor(selectedWorkflow.status).color,
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={`${selectedWorkflow.phases?.length || 0} Phases`}
                  sx={{
                    backgroundColor: 'rgba(238, 187, 195, 0.2)',
                    color: '#8b5cf6',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={`${selectedWorkflow.totalCandidates || 0} Total Candidates`}
                  sx={{
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Detailed Phase Information - Table Format */}
              <Box>
                <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 3, fontWeight: 600 }}>
                  Phase Details
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
                        background: 'rgba(139, 92, 246, 0.08)',
                        borderBottom: '2px solid rgba(238, 187, 195, 0.3)'
                      }}>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, width: '5%', textAlign: 'center', py: 2 }}>
                          #
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, width: '30%', py: 2 }}>
                          Phase Name
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, width: '20%', py: 2 }}>
                          Phase Type
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, width: '15%', py: 2 }}>
                          State
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, width: '15%', textAlign: 'center', py: 2 }}>
                          Candidates
                        </TableCell>
                      </TableRow>

                      {/* Phase Rows */}
                      {selectedWorkflow.phases?.map((phase, index) => {
                        const phaseKey = `${selectedWorkflow._id}-${index}`;
                        const isExpanded = expandedPhases[phaseKey];
                        return (
                        <React.Fragment key={index}>
                          {/* Main Phase Row */}
                          <TableRow
                            onClick={() => togglePhaseExpansion(selectedWorkflow._id, index)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                                '& td:first-of-type': {
                                  borderLeft: '3px solid #8b5cf6'
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
                                color: '#f8fafc',
                                fontSize: '0.9rem',
                                mx: 'auto'
                              }}>
                                {phase.phaseNumber}
                              </Box>
                            </TableCell>

                            {/* Phase Name */}
                            <TableCell sx={{ 
                              borderBottom: (phase.customFields && phase.customFields.length > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#1e293b',
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
                                  background: 'rgba(37, 99, 235, 0.1)',
                                  borderRadius: 1,
                                  border: '1px solid rgba(37, 99, 235, 0.18)'
                                }}>
                                  <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {phase.candidates?.length || 0}
                                  </Typography>
                                </Box>
                                {phase.candidates && phase.candidates.length > 0 && (
                                  <Box sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#2563eb'
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
                                              background: 'rgba(139, 92, 246, 0.08)'
                                            }
                                          }}
                                        >
                                          <TableCell sx={{ 
                                            color: '#8b5cf6', 
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            width: '30%',
                                            borderBottom: fieldIndex === phase.customFields.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                            py: 1
                                          }}>
                                            {field.key}
                                          </TableCell>
                                          <TableCell sx={{ 
                                            color: '#64748b',
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
                                  <Typography variant="subtitle1" sx={{ color: '#2563eb', fontWeight: 600, mb: 2 }}>
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
                                              <TableCell sx={{ color: '#1e293b', fontWeight: 600, width: '40%' }}>
                                                {candidate.name || 'Unknown'}
                                              </TableCell>
                                              <TableCell sx={{ color: '#64748b', width: '35%' }}>
                                                {candidate.email || 'No email'}
                                              </TableCell>
                                              <TableCell sx={{ color: '#64748b', width: '25%' }}>
                                                {candidate.phone || 'No phone'}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
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
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          justifyContent: 'center',
          position: 'sticky',
          bottom: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          zIndex: 1
        }}>
          <Button 
            onClick={() => setShowViewModal(false)}
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
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
          <WarningIcon sx={{ color: '#ff9800' }} />
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Delete Workflow
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
            Are you sure you want to delete this workflow?
          </Typography>
          {workflowToDelete && (
            <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
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

      {/* Status Filter Menu */}
      <Menu
        anchorEl={statusFilterAnchorEl}
        open={Boolean(statusFilterAnchorEl)}
        onClose={handleStatusFilterClose}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <MenuItem onClick={() => handleStatusFilterChange('All Statuses')}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ fontWeight: 600 }}>All Statuses</Typography>
            {currentStatusFilter === 'All Statuses' && <CheckIcon sx={{ ml: 2, color: '#2563eb' }} />}
          </Box>
        </MenuItem>
        {['Active', 'Completed', 'On Hold', 'Cancelled'].map((statusOption) => (
          <MenuItem
            key={statusOption}
            onClick={() => handleStatusFilterChange(statusOption)}
            sx={{ 
              color: getStatusColor(statusOption).color, 
              fontWeight: 600 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography sx={{ fontWeight: 600 }}>{statusOption}</Typography>
              {currentStatusFilter === statusOption && <CheckIcon sx={{ ml: 2, color: '#2563eb' }} />}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Workflow Filter Modal */}
      <WorkflowFilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={activeFilters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </Box>
  );
};

export default Workflows;
