import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';
import ClientSideStatusCreation from '../components/ClientSideStatusCreation';
import StatusChangeConfirmDialog from '../components/StatusChangeConfirmDialog';

const clientSideStatuses = [
  'Interview Scheduled',
  'Interview Completed',
  'Awaiting Feedback',
  'Feedback Received',
  'Shortlisted',
  'Rejected',
  'On Hold',
  'Offered',
  'Offer Accepted',
  'Offer Declined',
  'Joined',
  'No Show'
];

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('joined')) return '#4caf50';
  if (statusLower.includes('offer accepted')) return '#66bb6a';
  if (statusLower.includes('offered')) return '#81c784';
  if (statusLower.includes('shortlisted')) return '#42a5f5';
  if (statusLower.includes('feedback received')) return '#29b6f6';
  if (statusLower.includes('awaiting feedback')) return '#4fc3f7';
  if (statusLower.includes('interview completed')) return '#9575cd';
  if (statusLower.includes('interview scheduled')) return '#ba68c8';
  if (statusLower.includes('rejected') || statusLower.includes('no show')) return '#f44336';
  if (statusLower.includes('on hold')) return '#ff9800';
  if (statusLower.includes('offer declined')) return '#ff7043';
  return '#9e9e9e';
};

const WorkflowsSimple = ({ user }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, workflowId: null, jobTitle: '' });
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [preSelectedJobId, setPreSelectedJobId] = useState(null);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState({
    open: false,
    workflowId: null,
    candidateId: null,
    candidateName: '',
    currentStatus: '',
    newStatus: ''
  });

  useEffect(() => {
    fetchWorkflows();
    
    // Check if we should open creation modal with pre-selected job
    const workflowData = sessionStorage.getItem('workflowData');
    if (workflowData) {
      try {
        const data = JSON.parse(workflowData);
        setPreSelectedJobId(data.jobId);
        setShowCreationModal(true);
        sessionStorage.removeItem('workflowData');
      } catch (error) {
        console.error('Error parsing workflow data:', error);
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
      toast.error('Failed to fetch client side status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = (workflowId, candidateId, newStatus, candidateName, currentStatus) => {
    setStatusChangeConfirm({
      open: true,
      workflowId,
      candidateId,
      candidateName,
      currentStatus,
      newStatus
    });
  };

  const handleStatusChangeConfirm = async () => {
    const { workflowId, candidateId, newStatus } = statusChangeConfirm;
    setStatusChangeConfirm({ open: false, workflowId: null, candidateId: null, candidateName: '', currentStatus: '', newStatus: '' });
    
    const key = `${workflowId}-${candidateId}`;
    try {
      setUpdatingStatus(prev => ({ ...prev, [key]: true }));
      const token = localStorage.getItem('jwt');
      await axios.patch(
        `${API_URL}/api/workflows/${workflowId}/candidate-status`,
        {
          candidateId,
          clientSideStatus: newStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Status updated successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteWorkflow = (workflow) => {
    setDeleteConfirm({
      open: true,
      workflowId: workflow._id,
      jobTitle: workflow.jobTitle
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_URL}/api/workflows/${deleteConfirm.workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: user._id }
      });

      toast.success('Client side status deleted successfully!');
      fetchWorkflows();
      setDeleteConfirm({ open: false, workflowId: null, jobTitle: '' });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete');
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
            Client side status
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Track candidates submitted to clients and their current status
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setShowCreationModal(true)}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }
          }}
        >
          + Create Client Side Tracking
        </Button>
      </Box>

      {/* Workflows List */}
      {loading ? (
        <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
          Loading...
        </Typography>
      ) : workflows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(255, 255, 255, 0.7)' }}>
          <WorkIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
            No client side tracking yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Start by submitting candidates to a client from a job's linked candidates
          </Typography>
        </Paper>
      ) : (
        workflows.map((workflow) => (
          <Card
            key={workflow._id}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent>
              {/* Workflow Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: expandedWorkflowId === workflow._id ? 2 : 0
                }}
                onClick={() => setExpandedWorkflowId(expandedWorkflowId === workflow._id ? null : workflow._id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                    {expandedWorkflowId === workflow._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ color: '#8b5cf6', fontSize: '1.2rem' }} />
                      {workflow.jobTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <BusinessIcon sx={{ fontSize: '0.9rem' }} />
                      {workflow.organization}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${workflow.candidateStatuses?.length || 0} Candidates`}
                    sx={{
                      backgroundColor: 'rgba(139, 92, 246, 0.12)',
                      color: '#8b5cf6',
                      fontWeight: 600
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkflow(workflow);
                    }}
                    sx={{ color: '#ef4444' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Candidates List */}
              <Collapse in={expandedWorkflowId === workflow._id}>
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700 }}>Phone</TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 700, minWidth: 200 }}>Client Side Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workflow.candidateStatuses && workflow.candidateStatuses.length > 0 ? (
                        workflow.candidateStatuses.map((candidateStatus) => {
                          const candidate = candidateStatus.candidateId;
                          const key = `${workflow._id}-${candidate?._id}`;
                          
                          return (
                            <TableRow key={candidate?._id || candidateStatus._id}>
                              <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {candidate?.name || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ color: '#64748b' }}>
                                {candidate?.email || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ color: '#64748b' }}>
                                {candidate?.phone || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <FormControl size="small" fullWidth>
                                  <Select
                                    value={candidateStatus.clientSideStatus || 'Interview Scheduled'}
                                    onChange={(e) => handleStatusChangeRequest(
                                      workflow._id, 
                                      candidate?._id, 
                                      e.target.value,
                                      candidate?.name || 'N/A',
                                      candidateStatus.clientSideStatus || 'Interview Scheduled'
                                    )}
                                    disabled={updatingStatus[key]}
                                    sx={{
                                      color: getStatusColor(candidateStatus.clientSideStatus),
                                      fontWeight: 600,
                                      fontSize: '0.85rem',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: `${getStatusColor(candidateStatus.clientSideStatus)}40`,
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: getStatusColor(candidateStatus.clientSideStatus),
                                      },
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: getStatusColor(candidateStatus.clientSideStatus),
                                      },
                                      '& .MuiSelect-icon': {
                                        color: getStatusColor(candidateStatus.clientSideStatus),
                                      },
                                      backgroundColor: `${getStatusColor(candidateStatus.clientSideStatus)}10`,
                                    }}
                                  >
                                    {clientSideStatuses.map((status) => (
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
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                            No candidates in this workflow
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </CardContent>
          </Card>
        ))
      )}

      {/* Creation Modal */}
      <ClientSideStatusCreation
        open={showCreationModal}
        onClose={(wasCreated) => {
          setShowCreationModal(false);
          setPreSelectedJobId(null);
          if (wasCreated) {
            fetchWorkflows(); // Refresh list if workflow was created
          }
        }}
        preSelectedJobId={preSelectedJobId}
        user={user}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, workflowId: null, jobTitle: '' })}
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#1e293b', fontWeight: 600 }}>
          Delete Client Side Status?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            Are you sure you want to delete the client side tracking for "{deleteConfirm.jobTitle}"?
            This will also reset the job status to "In Progress".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, workflowId: null, jobTitle: '' })}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <StatusChangeConfirmDialog
        open={statusChangeConfirm.open}
        onClose={() => setStatusChangeConfirm({ open: false, workflowId: null, candidateId: null, candidateName: '', currentStatus: '', newStatus: '' })}
        onConfirm={handleStatusChangeConfirm}
        title="Confirm Client Side Status Change"
        currentStatus={statusChangeConfirm.currentStatus}
        newStatus={statusChangeConfirm.newStatus}
        itemName={statusChangeConfirm.candidateName}
        itemType="client status"
      />
    </Box>
  );
};

export default WorkflowsSimple;

