import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  OutlinedInput
} from '@mui/material';
import {
  Clear as ClearIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const WorkflowFilterModal = ({ open, onClose, filters, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      organization: '',
      jobTitle: '',
      status: []
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  const statusOptions = ['Active', 'Completed', 'On Hold'];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        pb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
          Workflow Filters
        </Typography>
        <IconButton onClick={onClose} size="small">
          <ClearIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Organization */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BusinessIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Organization</Typography>
            </Box>
            <TextField
              fullWidth
              label="Company Name"
              value={localFilters.organization}
              onChange={(e) => handleFilterChange('organization', e.target.value)}
              placeholder="e.g., StaffAnchor"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                }
              }}
            />
          </Box>

          {/* Job Title */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Job Title</Typography>
            </Box>
            <TextField
              fullWidth
              label="Position"
              value={localFilters.jobTitle}
              onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
              placeholder="e.g., Software Engineer"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                }
              }}
            />
          </Box>

          {/* Status */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AssessmentIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Status</Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={localFilters.status || []}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(139, 92, 246, 0.12)', 
                          color: '#8b5cf6' 
                        }} 
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Button 
          onClick={handleClear}
          sx={{ 
            color: '#64748b',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          Clear All
        </Button>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#64748b',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #3a7bd5 0%, #7c3aed 100%)',
            }
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowFilterModal;









