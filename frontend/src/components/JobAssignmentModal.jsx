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
      const response = await axios.get('https://staffanchor-ats-v1.onrender.com/api/auth/subordinates', {
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
      const response = await axios.get(`https://staffanchor-ats-v1.onrender.com/api/jobs/${job._id}/assignments`, {
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
      await axios.post(`https://staffanchor-ats-v1.onrender.com/api/jobs/${job._id}/assign`, {
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
      await axios.post(`https://staffanchor-ats-v1.onrender.com/api/jobs/${job._id}/unassign`, {
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
          background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
          color: '#f5f7fa',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        pb: 2
      }}>
        <AssignmentIcon sx={{ color: '#eebbc3' }} />
        <Typography variant="h6" sx={{ color: '#f5f7fa', fontWeight: 600 }}>
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
            <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ fontSize: 20 }} />
              Currently Assigned
            </Typography>
            <List sx={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 2, 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}>
              {assignedSubordinates.map((sub) => (
                <ListItem key={sub._id} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <ListItemText
                    primary={sub.fullName}
                    secondary={sub.email}
                    primaryTypographyProps={{ color: '#f5f7fa', fontWeight: 600 }}
                    secondaryTypographyProps={{ color: '#b8c5d6' }}
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
          <Typography variant="h6" sx={{ color: '#eebbc3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 20 }} />
            Available Subordinates
          </Typography>
          <List sx={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 2, 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {subordinates
              .filter(sub => !isAssigned(sub._id))
              .map((sub) => (
                <ListItem key={sub._id} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Checkbox
                    checked={selectedSubordinates.includes(sub._id)}
                    onChange={() => handleSubordinateToggle(sub._id)}
                    sx={{ 
                      color: '#eebbc3',
                      '&.Mui-checked': { color: '#eebbc3' }
                    }}
                  />
                  <ListItemText
                    primary={sub.fullName}
                    secondary={`${sub.email} • ${sub.organization}`}
                    primaryTypographyProps={{ color: '#f5f7fa', fontWeight: 600 }}
                    secondaryTypographyProps={{ color: '#b8c5d6' }}
                  />
                </ListItem>
              ))}
          </List>
        </Box>

        {selectedSubordinates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#b8c5d6', mb: 1 }}>
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
                    color: '#eebbc3',
                    '& .MuiChip-deleteIcon': { color: '#eebbc3' }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
        pt: 2, 
        px: 3 
      }}>
        <Button 
          onClick={handleClose} 
          sx={{ color: '#b8c5d6' }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || selectedSubordinates.length === 0}
          sx={{
            backgroundColor: '#eebbc3',
            color: '#1a1a2e',
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
