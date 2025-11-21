import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import API_URL from '../config/api';

const JobAssignmentModal = ({ open, onClose, job, onAssignmentSuccess }) => {
  const [subordinates, setSubordinates] = useState([]);
  const [selectedSubordinates, setSelectedSubordinates] = useState([]);
  const [assignedSubordinates, setAssignedSubordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && job) {
      fetchSubordinates();
      fetchJobAssignments();
    }
  }, [open, job]);

  const fetchSubordinates = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/auth/subordinates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubordinates(response.data);
    } catch (err) {
      setError('Failed to fetch subordinates');
    }
  };

  const fetchJobAssignments = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_URL}/api/jobs/${job._id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignedSubordinates(response.data.assignedSubordinates || []);
    } catch (err) {
      console.error('Failed to fetch job assignments:', err);
    }
  };

  const handleSubordinateToggle = (subordinateId) => {
    setSelectedSubordinates(prev => {
      if (prev.includes(subordinateId)) {
        return prev.filter(id => id !== subordinateId);
      } else {
        return [...prev, subordinateId];
      }
    });
  };

  const handleAssign = async () => {
    if (selectedSubordinates.length === 0) {
      setError('Please select at least one subordinate');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/jobs/${job._id}/assign`, {
        subordinateIds: selectedSubordinates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Job assigned successfully!');
      setSelectedSubordinates([]);
      fetchJobAssignments();
      
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign job');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (subordinateId) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`${API_URL}/api/jobs/${job._id}/unassign`, {
        subordinateIds: [subordinateId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Job unassigned successfully!');
      fetchJobAssignments();
      
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unassign job');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSubordinates([]);
    setError('');
    setSuccess('');
    onClose();
  };

  const getSubordinateName = (subordinateId) => {
    const subordinate = subordinates.find(sub => sub._id === subordinateId);
    return subordinate ? subordinate.fullName : 'Unknown';
  };

  const getSubordinateEmail = (subordinateId) => {
    const subordinate = subordinates.find(sub => sub._id === subordinateId);
    return subordinate ? subordinate.email : 'Unknown';
  };

  const isAssigned = (subordinateId) => {
    return assignedSubordinates.some(sub => sub._id === subordinateId);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          color: '#1e293b',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2
      }}>
        <AssignmentIcon sx={{ color: '#8b5cf6' }} />
        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Assign Job: {job?.title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
            {success}
          </Alert>
        )}

        {/* Currently Assigned Subordinates */}
        {assignedSubordinates.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ fontSize: 20 }} />
              Currently Assigned
            </Typography>
            <List sx={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 2, 
              border: '1px solid rgba(0, 0, 0, 0.05)' 
            }}>
              {assignedSubordinates.map((sub) => (
                <ListItem key={sub._id} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <ListItemText
                    primary={sub.fullName}
                    secondary={sub.email}
                    primaryTypographyProps={{ color: '#1e293b', fontWeight: 600 }}
                    secondaryTypographyProps={{ color: '#64748b' }}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleUnassign(sub._id)}
                      disabled={loading}
                      sx={{ 
                        borderColor: '#f44336', 
                        color: '#f44336',
                        '&:hover': { 
                          borderColor: '#f44336', 
                          backgroundColor: 'rgba(244, 67, 54, 0.1)' 
                        }
                      }}
                    >
                      Unassign
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Available Subordinates */}
        <Box>
          <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 20 }} />
            Available Subordinates
          </Typography>
          <List sx={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 2, 
            border: '1px solid rgba(0, 0, 0, 0.05)',
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {subordinates
              .filter(sub => !isAssigned(sub._id))
              .map((sub) => (
                <ListItem key={sub._id} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <Checkbox
                    checked={selectedSubordinates.includes(sub._id)}
                    onChange={() => handleSubordinateToggle(sub._id)}
                    sx={{ 
                      color: '#8b5cf6',
                      '&.Mui-checked': { color: '#8b5cf6' }
                    }}
                  />
                  <ListItemText
                    primary={sub.fullName}
                    secondary={`${sub.email} • ${sub.organization}`}
                    primaryTypographyProps={{ color: '#1e293b', fontWeight: 600 }}
                    secondaryTypographyProps={{ color: '#64748b' }}
                  />
                </ListItem>
              ))}
          </List>
        </Box>

        {selectedSubordinates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Selected for assignment:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedSubordinates.map(subId => (
                <Chip
                  key={subId}
                  label={getSubordinateName(subId)}
                  onDelete={() => handleSubordinateToggle(subId)}
                  sx={{
                    backgroundColor: 'rgba(238, 187, 195, 0.2)',
                    color: '#8b5cf6',
                    '& .MuiChip-deleteIcon': { color: '#8b5cf6' }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: '1px solid rgba(0, 0, 0, 0.05)', 
        pt: 2, 
        px: 3 
      }}>
        <Button 
          onClick={handleClose} 
          sx={{ color: '#64748b' }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || selectedSubordinates.length === 0}
          sx={{
            backgroundColor: '#8b5cf6',
            color: '#f8fafc',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#d4a5a8' },
            '&:disabled': { backgroundColor: 'rgba(238, 187, 195, 0.3)' }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Assign Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobAssignmentModal;
